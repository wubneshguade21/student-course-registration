const db = require("../db");

const getAllDepartments = async () => {
    const [rows] = await db.query(
        "SELECT id, name FROM departments WHERE deleted_at IS NULL"
    );

    return rows;
};
const getDepartmentById = async (id) => {
    const [rows] = await db.query(
        "SELECT id, name FROM departments WHERE id = ? AND deleted_at IS NULL",
        [id]
    );

    return rows[0];
}; 
const createDepartment = async (name) => {
    const [result] = await db.query(
        "INSERT INTO departments (name) VALUES (?)",
        [name]
    );

    return result.insertId;
};
const updateDepartment = async (id, name) => {
    const [result] = await db.query(
        "UPDATE departments SET name = ? WHERE id = ? AND deleted_at IS NULL",
        [name, id]
    );

    return result.affectedRows;
};
const deleteDepartment = async (id) => {
    const [result] = await db.query(
        "UPDATE departments SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL",
        [id]
    );

    return result.affectedRows;
};
 
module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
     updateDepartment,
    deleteDepartment
};