const db = require("../db");

const getAllStudents = async () => {
    const [rows] = await db.query(
        `SELECT id, user_id, name, email, department_id, year, semester
         FROM students
         WHERE deleted_at IS NULL`
    );
    return rows;
};

const getStudentById = async (id) => {
    const [rows] = await db.query(
        `SELECT id, user_id, name, email, department_id, year, semester
         FROM students
         WHERE id = ? AND deleted_at IS NULL`,
        [id]
    );
    return rows[0];
};

const createStudent = async (
    name,
    email,
    department_id,
    user_id = null,
    year = 1,
    semester = 1
) => {
    const [result] = await db.query(
        `INSERT INTO students (user_id, name, email, department_id, year, semester)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, name, email, department_id, year, semester]
    );
    return result.insertId;
};

const updateStudent = async (id, name, email, department_id, year, semester) => {
    const [result] = await db.query(
        `UPDATE students
         SET name = ?, email = ?, department_id = ?, year = ?, semester = ?
         WHERE id = ? AND deleted_at IS NULL`,
        [name, email, department_id, year, semester, id]
    );
    return result.affectedRows;
};

const deleteStudent = async (id) => {
    const [result] = await db.query(
        `UPDATE students
         SET deleted_at = CURRENT_TIMESTAMP
         WHERE id = ? AND deleted_at IS NULL`,
        [id]
    );
    return result.affectedRows;
};

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};