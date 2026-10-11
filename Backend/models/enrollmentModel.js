const db = require("../db");

const getAllEnrollments = async (userId, isAdmin) => {
    const query = isAdmin
        ? `SELECT id, student_id, course_id, registered_at
           FROM enrollments
           WHERE deleted_at IS NULL`
        : `SELECT e.id, e.student_id, e.course_id, e.registered_at
           FROM enrollments AS e
           JOIN students AS s ON e.student_id = s.id
           WHERE e.deleted_at IS NULL
             AND s.user_id = ?
             AND s.deleted_at IS NULL`;

    const [rows] = await db.query(
        query,
        isAdmin ? [] : [userId]
    );

    return rows;
};
const getEnrollmentById = async (id, userId, isAdmin) => {
    const query = isAdmin
        ? `SELECT id, student_id, course_id, registered_at
           FROM enrollments
           WHERE id = ? AND deleted_at IS NULL`
        : `SELECT e.id, e.student_id, e.course_id, e.registered_at
           FROM enrollments AS e
           JOIN students AS s ON e.student_id = s.id
           WHERE e.id = ?
             AND e.deleted_at IS NULL
             AND s.user_id = ?
             AND s.deleted_at IS NULL`;

    const [rows] = await db.query(
        query,
        isAdmin ? [id] : [id, userId]
    );

    return rows[0];
};

const getStudentIdByUserId = async (userId) => { const [rows] = await db.query( `SELECT id FROM students WHERE user_id = ? AND deleted_at IS NULL`, [userId] ); return rows.length > 0 ? rows[0].id : null; };
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
const deleteEnrollment = async (id, userId, isAdmin) => {
    const query = isAdmin
        ? `UPDATE enrollments
           SET deleted_at = NOW()
           WHERE id = ? AND deleted_at IS NULL`
        : `UPDATE enrollments AS e
           JOIN students AS s ON e.student_id = s.id
           SET e.deleted_at = NOW()
           WHERE e.id = ?
             AND e.deleted_at IS NULL
             AND s.user_id = ?
             AND s.deleted_at IS NULL`;

    const [result] = await db.query(
        query,
        isAdmin ? [id] : [id, userId]
    );

    return result.affectedRows;
};


module.exports = {
    getAllEnrollments,
    getEnrollmentById,
    getStudentIdByUserId,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment
};