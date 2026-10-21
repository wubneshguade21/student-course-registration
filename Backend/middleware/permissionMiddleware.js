
const db = require("../db");

const permissionMiddleware = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.userId) {
                return res.status(401).json({
                    message: "Authentication required."
                });
            }
            const [rows] = await db.query(
                `SELECT p.name
                 FROM users AS u
                 JOIN role_permissions AS rp
                    ON u.role_id = rp.role_id
                 JOIN permissions AS p
                    ON rp.permission_id = p.id
                 WHERE u.id = ?
                   AND u.deleted_at IS NULL
                   AND p.name = ?`,
                [req.user.userId, requiredPermission]
            );
            if (rows.length === 0) {
                return res.status(403).json({
                    message: "Forbidden. You do not have permission to perform this action."
                });
            }
            return next();
        } catch (error) {
            console.error(
                "Permission check failed:",
                error.message
            );

            return res.status(500).json({
                message: "Server error while checking permissions."
            });
        }
    };
};

module.exports = permissionMiddleware;