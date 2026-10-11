
const db = require("../db");

const getDashboardStats = async (req, res) => {
    try {
        const [studentRows] = await db.query(
            "SELECT COUNT(*) AS total_students FROM students"
        );

        const [courseRows] = await db.query(
            "SELECT COUNT(*) AS total_courses FROM courses"
        );

        const [enrollmentRows] = await db.query(
            "SELECT COUNT(*) AS total_enrollments FROM enrollments"
        );

        return res.status(200).json({
            total_students: studentRows[0].total_students,
            total_courses: courseRows[0].total_courses,
            total_enrollments: enrollmentRows[0].total_enrollments
        });
    } catch (error) {
        console.error("Dashboard error:", error.message);

        return res.status(500).json({
            message: "Failed to load dashboard statistics."
        });
    }
};

module.exports = { getDashboardStats };