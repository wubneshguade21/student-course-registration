const db = require("../db");

const getUserByEmail = async (email) => {
    const [rows] = await db.query(
        "SELECT id, name, email, password FROM users WHERE email = ? AND deleted_at IS NULL",
        [email]
    );
    return rows[0];
};

const createUser = async (name, email, password) => {
    const [result] = await db.query(
        `INSERT INTO users
        (name, email, password)
        VALUES (?, ?, ?)`,
        [name, email, password]
    );
    return result.insertId;
};

module.exports = {
    getUserByEmail,
    createUser
};