const db = require("../db");

const passwordChangeMiddleware = async (req, res, next) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        const [rows] = await db.query(
            `SELECT must_change_password
             FROM users
             WHERE id = ? AND deleted_at IS NULL`,
            [req.user.userId]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                message: "User not found."
            });
        }

        if (rows[0].must_change_password === 1) {
            return res.status(403).json({
                message: "Please change your temporary password before continuing."
            });
        }

        return next();
    } catch (error) {
        console.error("Password check failed:", error.message);

        return res.status(500).json({
            message: "Server error while checking password status."
        });
    }
};

module.exports = passwordChangeMiddleware;