const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const userModel = require("../models/userModel");
const registerUser = async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

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
            2,
            connection
        );

        await connection.query(
            `INSERT INTO students
                (user_id, name, email, department_id)
             VALUES (?, ?, ?, NULL)`,
            [userId, normalizedName, normalizedEmail]
        );

        await connection.commit();

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
module.exports = {
    registerUser,
    loginUser,
    changePassword,
    getMyPermissions,
    updateMyDepartment
};