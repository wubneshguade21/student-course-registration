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

        const [departmentRows] = await db.query(
            "SELECT COUNT(*) AS total_departments FROM departments WHERE deleted_at IS NULL"
        );

        return res.status(200).json({
            total_students: studentRows[0].total_students,
            total_courses: courseRows[0].total_courses,
            total_departments: departmentRows[0].total_departments,
            total_enrollments: enrollmentRows[0].total_enrollments
        });
    } catch (error) {
        console.error("Dashboard error:", error.message);

        return res.status(500).json({
            message: "Failed to load dashboard statistics."
        });
    }
};

const getMyDashboardStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const [studentRows] = await db.query(
            "SELECT id FROM students WHERE user_id = ? AND deleted_at IS NULL",
            [userId]
        );

        if (studentRows.length === 0) {
            return res.status(404).json({
                message: "Student record not found for this user"
            });
        }

        const studentId = studentRows[0].id;
        const [myEnrollRows] = await db.query(
            `SELECT COUNT(*) AS my_enrollments
             FROM enrollments
             WHERE student_id = ? AND deleted_at IS NULL`,
            [studentId]
        );
        const [courseRows] = await db.query(
            "SELECT COUNT(*) AS available_courses FROM courses WHERE deleted_at IS NULL"
        );
        const [myCourses] = await db.query(
            `SELECT e.id AS enrollment_id,
                    c.id AS course_id,
                    c.course_code,
                    c.course_name,
                    c.credit_hour,
                    e.registered_at
             FROM enrollments e
             JOIN courses c ON e.course_id = c.id
             WHERE e.student_id = ?
               AND e.deleted_at IS NULL
               AND c.deleted_at IS NULL
             ORDER BY e.registered_at DESC`,
            [studentId]
        );

        return res.status(200).json({
            my_enrollments: myEnrollRows[0].my_enrollments,
            available_courses: courseRows[0].available_courses,
            my_courses: myCourses
        });
    } catch (error) {
        console.error("My dashboard error:", error.message);

        return res.status(500).json({
            message: "Failed to load your dashboard."
        });
    }
};

module.exports = { getDashboardStats, getMyDashboardStats };