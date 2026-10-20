const db = require("../db");

// Save a new log
const logActivity = async (userId, action, entityType, entityName) => {
    try {
        await db.query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_name) 
             VALUES (?, ?, ?, ?)`,
            [userId || null, action, entityType, entityName]
        );
    } catch (error) {
        console.error("Failed to save activity log:", error.message);
    }
};

// Get recent logs (for admin view)
const getRecentActivities = async (limit = 50) => {
    const [rows] = await db.query(
        `SELECT 
            a.id, a.action, a.entity_type, a.entity_name, a.created_at,
            u.name AS user_name, u.role_id
         FROM activity_logs a
         LEFT JOIN users u ON a.user_id = u.id
         ORDER BY a.created_at DESC
         LIMIT ?`,
        [limit]
    );
    return rows;
};

module.exports = { logActivity, getRecentActivities };