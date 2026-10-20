const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const userModel = require("../models/userModel");
const settingsModel = require("../models/settingsModel");
const activityLogModel = require("../models/activityLogModel"); // NEW: Import activity log model

// ====================== REGISTER ======================
const registerUser = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        // Check if registration is open
        const registrationOpen = await settingsModel.getSetting("registration_open");
        if (registrationOpen === "false") {
            return res.status(403).json({
                message: "Student registration is currently closed"
            });
        }

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        const passwordRegex =
            /^(?=.{8,}$)(?:(?=.*[A-Za-z])(?=.*\d)|(?=.*[A-Za-z])(?=.*[^A-Za-z\d\s])|(?=.*\d)(?=.*[^A-Za-z\d\s])).*$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long and contain at least two of these: letters, numbers, and special symbols."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedName = name.trim();

        const [existingUsers] = await connection.query(
            "SELECT id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        const [existingStudents] = await connection.query(
            "SELECT id FROM students WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUsers.length > 0 || existingStudents.length > 0) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.beginTransaction();

        const userId = await userModel.createUser(
            normalizedName,
            normalizedEmail,
            hashedPassword,
            2, // role_id = student
            connection
        );

        await connection.query(
            `INSERT INTO students
                (user_id, name, email, department_id)
             VALUES (?, ?, ?, NULL)`,
            [userId, normalizedName, normalizedEmail]
        );

        await connection.commit();

        // NEW: Log Activity
        await activityLogModel.logActivity(
            userId,
            "REGISTER",
            "student",
            `${normalizedName} (${normalizedEmail})`
        );

        return res.status(201).json({
            message: "Student registered successfully",
            userId
        });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback error:", rollbackError.message);
            }
        }

        console.error("Registration error:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        return res.status(500).json({
            message: "Server error"
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// ====================== LOGIN ======================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await userModel.getUserByEmail(normalizedEmail);

        if (!existingUser) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check system status (only block non-admins)
        const systemStatus = await settingsModel.getSetting("system_status");
        if (systemStatus === "inactive" && existingUser.role !== "admin") {
            return res.status(403).json({
                message: "System is currently inactive. Please try again later."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: existingUser.id,
                role_id: existingUser.role_id,
                role: existingUser.role,
                must_change_password: existingUser.must_change_password
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful",
            userId: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role_id: existingUser.role_id,
            role: existingUser.role,
            must_change_password: existingUser.must_change_password,
            student_id: existingUser.student_id || null,
            department_id: existingUser.department_id || null,
            year: existingUser.year || null,
            semester: existingUser.semester || null,
            token
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// ====================== CHANGE PASSWORD ======================
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }

        const passwordRegex =
            /^(?=.{8,}$)(?:(?=.*[A-Za-z])(?=.*\d)|(?=.*[A-Za-z])(?=.*[^A-Za-z\d\s])|(?=.*\d)(?=.*[^A-Za-z\d\s])).*$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: "New password must be at least 8 characters and contain at least two character types"
            });
        }

        const [rows] = await db.query(
            `SELECT id, password, must_change_password
             FROM users
             WHERE id = ? AND deleted_at IS NULL`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Current password is incorrect"
            });
        }

        const samePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (samePassword) {
            return res.status(400).json({
                message: "New password must be different from current password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            `UPDATE users
             SET password = ?, must_change_password = 0
             WHERE id = ?`,
            [hashedPassword, userId]
        );

        return res.status(200).json({
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Change password error:", error.message);

        return res.status(500).json({
            message: "Failed to change password"
        });
    }
};

// ====================== GET MY PERMISSIONS ======================
const getMyPermissions = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [rows] = await db.query(
            `SELECT p.name AS permission
             FROM users AS u
             JOIN role_permissions AS rp
                ON u.role_id = rp.role_id
             JOIN permissions AS p
                ON rp.permission_id = p.id
             WHERE u.id = ?
               AND u.deleted_at IS NULL`,
            [userId]
        );

        const permissions = rows.map((r) => r.permission);

        return res.status(200).json({
            permissions
        });
    } catch (error) {
        console.error("Get permissions error:", error.message);

        return res.status(500).json({
            message: "Failed to load permissions"
        });
    }
};

// ====================== UPDATE MY DEPARTMENT ======================
const updateMyDepartment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { department_id } = req.body;

        if (!department_id) {
            return res.status(400).json({
                message: "department_id is required"
            });
        }

        const [studentRows] = await db.query(
            `SELECT id FROM students
             WHERE user_id = ? AND deleted_at IS NULL`,
            [userId]
        );

        if (studentRows.length === 0) {
            return res.status(404).json({
                message: "Student record not found for this user"
            });
        }

        const studentId = studentRows[0].id;

        const [deptRows] = await db.query(
            `SELECT id, name FROM departments
             WHERE id = ? AND deleted_at IS NULL`,
            [department_id]
        );

        if (deptRows.length === 0) {
            return res.status(400).json({
                message: "Department not found"
            });
        }

        await db.query(
            `UPDATE students SET department_id = ?
             WHERE id = ?`,
            [department_id, studentId]
        );

        return res.status(200).json({
            message: "Department updated successfully",
            department_id: Number(department_id),
            department_name: deptRows[0].name
        });
    } catch (error) {
        console.error("Update department error:", error.message);

        return res.status(500).json({
            message: "Failed to update department"
        });
    }
};

// ====================== 1. UPDATE MY PROFILE (Name) ======================
const updateMyProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.userId;
    console.log("=== UPDATE PROFILE ===");
    console.log("userId:", userId);
    console.log("name:", name);
    console.log("email:", email);

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    // Check if email already used by another user
    const [existing] = await db.query(
      `SELECT id FROM users 
       WHERE email = ? AND id != ? AND deleted_at IS NULL`,
      [normalizedEmail, userId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const affected = await userModel.updateUserProfile(
      userId,
      normalizedName,
      normalizedEmail
    );

    if (affected === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // NEW: Log Activity
    await activityLogModel.logActivity(
      userId,
      "UPDATE",
      "profile",
      `Updated own profile to ${normalizedName}`
    );

    return res.status(200).json({
      message: "Profile updated successfully",
      name: normalizedName,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// ====================== 2. RESET STUDENT PASSWORD ======================
const resetStudentPassword = async (req, res) => {
    try {
        const { studentId } = req.params;

        let defaultPassword = await settingsModel.getSetting("default_password");
        if (!defaultPassword) defaultPassword = "123456";

        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const affected = await userModel.resetPassword(
            studentId,
            hashedPassword,
            1 // must_change_password = 1
        );

        if (affected === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        // NEW: Log Activity
        await activityLogModel.logActivity(
            req.user.userId,
            "UPDATE",
            "student_password",
            `Reset password for student ID ${studentId}`
        );

        return res.status(200).json({
            message: "Password reset successfully",
            temporaryPassword: defaultPassword
        });
    } catch (error) {
        console.error("Reset password error:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
};

// ====================== 3. GET SYSTEM SETTINGS ======================
const getSystemSettings = async (req, res) => {
    try {
        const settings = await settingsModel.getAllSettings();
        return res.status(200).json(settings);
    } catch (error) {
        console.error("Get settings error:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
};

// ====================== 4. UPDATE SYSTEM SETTINGS ======================
const updateSystemSettings = async (req, res) => {
    try {
        const {
            system_status,
            registration_open,
            default_password,
            system_name,
        } = req.body;

        if (system_status !== undefined) {
            if (!["active", "inactive"].includes(system_status)) {
                return res.status(400).json({
                    message: "system_status must be 'active' or 'inactive'"
                });
            }
            await settingsModel.updateSetting("system_status", system_status);
        }

        if (registration_open !== undefined) {
            const value =
                registration_open === true || registration_open === "true"
                    ? "true"
                    : "false";
            await settingsModel.updateSetting("registration_open", value);
        }

        if (default_password !== undefined) {
            if (default_password.length < 4) {
                return res.status(400).json({
                    message: "Default password must be at least 4 characters"
                });
            }
            await settingsModel.updateSetting("default_password", default_password);
        }

        if (system_name !== undefined) {
            const trimmed = String(system_name).trim();
            if (trimmed.length === 0 || trimmed.length > 60) {
                return res.status(400).json({
                    message: "System name must be between 1 and 60 characters"
                });
            }
            await settingsModel.updateSetting("system_name", trimmed);
        }

        // NEW: Log Activity
        await activityLogModel.logActivity(
            req.user.userId,
            "UPDATE",
            "system_settings",
            "Updated system configuration settings"
        );

        return res.status(200).json({ message: "Settings updated successfully" });
    } catch (error) {
        console.error("Update settings error:", error.message);
        return res.status(500).json({ message: "Server error" });
    }
};

// ====================== RECOVER ADMIN PASSWORD ======================
const recoverAdminPassword = async (req, res) => {
  try {
    const { recoveryCode, newPassword } = req.body;

    if (!recoveryCode || !newPassword) {
      return res.status(400).json({
        message: "Recovery code and new password are required",
      });
    }

    if (recoveryCode !== process.env.ADMIN_RECOVERY_CODE) {
      return res.status(403).json({ message: "Invalid recovery code" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await db.query(
      `UPDATE users 
       SET password = ?, must_change_password = 0 
       WHERE role_id = 1`,
      [hashedPassword]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    return res.status(200).json({
      message: "Admin password reset successfully",
    });
  } catch (error) {
    console.error("Recover admin error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// ====================== GET ACTIVITIES ======================
const getActivities = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                a.id, a.action, a.entity_type, a.entity_name, a.created_at,
                u.name AS user_name
             FROM activity_logs a
             LEFT JOIN users u ON a.user_id = u.id
             ORDER BY a.created_at DESC
             LIMIT 50`
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching activities:", error.message);
        res.status(500).json({ message: "Failed to fetch activities" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    changePassword,
    getMyPermissions,
    updateMyDepartment,
    updateMyProfile,
    resetStudentPassword,
    getSystemSettings,
    updateSystemSettings,
    recoverAdminPassword,
    getActivities 
};