const db = require("../db");

const getAllCourses = async () => {
    const [rows] = await db.query(
        "SELECT id, course_code, course_name, credit_hour, department_id FROM courses WHERE deleted_at IS NULL"
    );

    return rows;
};
const getCourseById = async (id) => {
    const [rows] = await db.query(
        "SELECT id, course_code, course_name, credit_hour, department_id FROM courses WHERE id = ? AND deleted_at IS NULL",
        [id]
    );

    return rows[0];
};
const createCourse = async (course_code, course_name, credit_hour, department_id) => {
    const [result] = await db.query(
        `INSERT INTO courses
        (course_code, course_name, credit_hour, department_id)
        VALUES (?, ?, ?, ?)`,
        [course_code, course_name, credit_hour, department_id]
    );

    return result.insertId;
};
const updateCourse = async (
    id,
    course_code,
    course_name,
    credit_hour,
    department_id
) => {
    const [result] = await db.query(
        `UPDATE courses
         SET course_code = ?,
             course_name = ?,
             credit_hour = ?,
             department_id = ?
         WHERE id = ? AND deleted_at IS NULL`,
        [
            course_code,
            course_name,
            credit_hour,
            department_id,
            id
        ]
    );

    return result.affectedRows;
};
const deleteCourse = async (id) => {
    const [result] = await db.query(
        `UPDATE courses
         SET deleted_at = NOW()
         WHERE id = ? AND deleted_at IS NULL`,
        [id]
    );

    return result.affectedRows;
};
module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse 
};