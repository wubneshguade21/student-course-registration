const studentModel = require("../models/studentModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../db");
const getStudents = async (req, res) => {
    try {
        const students = await studentModel.getAllStudents();
        res.status(200).json(students);
    } catch (error) {
        console.error("Error getting students:", error.message);
        res.status(500).json({
            message: "Failed to get students"
        });
    }
};
const getStudentById = async (req, res) => {
    try {
        const student = await studentModel.getStudentById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json(student);
    } catch (error) {
        console.error("Error getting student:", error.message);
        res.status(500).json({
            message: "Failed to get student"
        });
    }
};
const createStudent = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const { name, email, department_id, year, semester } = req.body;

        if (!name?.trim() || !email?.trim() || !department_id) {
            return res.status(400).json({
                message: "Name, email and department_id are required"
            });
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const departmentId = Number(department_id);
        const studentYear = Number(year) || 1;
        const studentSemester = Number(semester) || 1;

        if (!Number.isInteger(departmentId) || departmentId <= 0) {
            return res.status(400).json({
                message: "department_id must be a valid positive integer"
            });
        }

        connection = await db.getConnection();

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

        const [departments] = await connection.query(
            `SELECT id
             FROM departments
             WHERE id = ? AND deleted_at IS NULL`,
            [departmentId]
        );

        if (departments.length === 0) {
            return res.status(400).json({
                message: "Department not found"
            });
        }

        const firstName = normalizedName.split(" ")[0];
        const temporaryPassword =
            firstName.charAt(0).toUpperCase() +
            firstName.slice(1).toLowerCase() +
            "@12345678";

        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        await connection.beginTransaction();
        transactionStarted = true;

        const [userResult] = await connection.query(
            `INSERT INTO users
                (name, email, password, role_id, must_change_password)
             VALUES (?, ?, ?, ?, TRUE)`,
            [normalizedName, normalizedEmail, hashedPassword, 2]
        );

        const userId = userResult.insertId;

        const [studentResult] = await connection.query(
            `INSERT INTO students
                (user_id, name, email, department_id, year, semester)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId,
                normalizedName,
                normalizedEmail,
                departmentId,
                studentYear,
                studentSemester
            ]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            message: "Student and login account created successfully",
            studentId: studentResult.insertId,
            userId: userId,
            temporaryPassword: temporaryPassword
        });

    } catch (error) {
        if (connection && transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback error:", rollbackError.message);
            }
        }

        console.error("Error creating student:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        return res.status(500).json({
            message: "Failed to create student"
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
const updateStudent = async (req, res) => {
    try {
        const { name, email, department_id, year, semester } = req.body;
        const { id } = req.params;

        if (!name || !email || !department_id) {
            return res.status(400).json({
                message: "Name, email and department_id are required"
            });
        }

        const affectedRows = await studentModel.updateStudent(
            id,
            name,
            email,
            department_id,
            Number(year) || 1,
            Number(semester) || 1
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student updated successfully"
        });
    } catch (error) {
        console.error("Error updating student:", error.message);
        res.status(500).json({
            message: "Failed to update student"
        });
    }
};
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const affectedRows = await studentModel.deleteStudent(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting student:", error.message);
        res.status(500).json({
            message: "Failed to delete student"
        });
    }
};
module.exports = {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};