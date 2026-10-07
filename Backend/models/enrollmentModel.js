const db = require("../db");

const getAllEnrollments = async () => {
    const [rows] = await db.query(
        "SELECT id, student_id, course_id, registered_at FROM enrollments WHERE deleted_at IS NULL"
    );

    return rows;
};
const getEnrollmentById = async (id) => {
    const [rows] = await db.query(
        "SELECT id, student_id, course_id, registered_at FROM enrollments WHERE id = ? AND deleted_at IS NULL",
        [id]
    );

    return rows[0];
};
const createEnrollment = async (student_id, course_id) => {
    const [result] = await db.query(
        `INSERT INTO enrollments
        (student_id, course_id)
        VALUES (?, ?)`,
        [student_id, course_id]
    );

    return result.insertId;
};
const updateEnrollment = async (id, student_id, course_id) => {
    const [result] = await db.query(
        `UPDATE enrollments
         SET student_id = ?,
             course_id = ?
         WHERE id = ? AND deleted_at IS NULL`,
        [student_id, course_id, id]
    );

    return result.affectedRows;
};
const deleteEnrollment = async (id) => {
    const [result] = await db.query(
        `UPDATE enrollments
         SET deleted_at = NOW()
         WHERE id = ? AND deleted_at IS NULL`,
        [id]
    );

    return result.affectedRows;
};
module.exports = {
    getAllEnrollments,
    getEnrollmentById,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment
};