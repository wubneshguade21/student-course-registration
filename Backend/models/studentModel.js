const db = require("../db");

const getAllStudents = async () => {
    const [rows] = await db.query(
        `SELECT id, user_id, name, email, department_id
         FROM students
         WHERE deleted_at IS NULL`
    );

    return rows;
};

const getStudentById = async (id) => {
    const [rows] = await db.query(
        `SELECT id, user_id, name, email, department_id
         FROM students
         WHERE id = ? AND deleted_at IS NULL`,
        [id]
    );

    return rows[0];
};

const createStudent = async (name, email, department_id, user_id = null) => {
    const [result] = await db.query(
        `INSERT INTO students (user_id, name, email, department_id)
         VALUES (?, ?, ?, ?)`,
        [user_id, name, email, department_id]
    );

    return result.insertId;
};

const updateStudent = async (id, name, email, department_id) => {
    const [result] = await db.query(
        `UPDATE students
         SET name = ?, email = ?, department_id = ?
         WHERE id = ? AND deleted_at IS NULL`,
        [name, email, department_id, id]
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