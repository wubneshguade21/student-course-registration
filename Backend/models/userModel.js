const db = require("../db");

const getUserByEmail = async (email) => {
    const [rows] = await db.query(
        `SELECT
            users.id,
            users.name,
            users.email,
            users.password,
            users.role_id,
            users.must_change_password,
            roles.name AS role,
            students.id AS student_id,
            students.department_id AS department_id,
            students.year AS year,
            students.semester AS semester
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id
        LEFT JOIN students ON students.user_id = users.id
            AND students.deleted_at IS NULL
        WHERE users.email = ?
        AND users.deleted_at IS NULL`,
        [email]
    );

    return rows[0];
};

const createUser = async (
    name,
    email,
    password,
    roleId = 2,
    connection = db
) => {
    const [result] = await connection.query(
        `INSERT INTO users (name, email, password, role_id)
         VALUES (?, ?, ?, ?)`,
        [name, email, password, roleId]
    );

    return result.insertId;
};
const updateUserProfile = async (userId, name, email) => {
    console.log("Updating userId:", userId, "name:", name, "email:", email);

    
    const [userResult] = await db.query(
        `UPDATE users 
         SET name = ?, email = ? 
         WHERE id = ?`,
        [name, email, userId]
    );

    console.log("Users affectedRows:", userResult.affectedRows);

    
    await db.query(
        `UPDATE students 
         SET name = ?, email = ? 
         WHERE user_id = ?`,
        [name, email, userId]
    );

    return userResult.affectedRows;
};
const resetPassword = async (userId, hashedPassword, mustChange = 1) => {
    const [result] = await db.execute(
        "UPDATE users SET password = ?, must_change_password = ? WHERE id = ?",
        [hashedPassword, mustChange, userId]
    );
    return result.affectedRows;
};

module.exports = {
    getUserByEmail,
    createUser,
    updateUserProfile,
    resetPassword
};