const enrollmentModel = require("../models/enrollmentModel");
const activityLogModel = require("../models/activityLogModel"); // Activity Log import

const getAllEnrollments = async (req, res) => {
    try {
        const isAdmin = req.user.role === "admin";

        const enrollments = await enrollmentModel.getAllEnrollments(
            req.user.userId,
            isAdmin
        );

        res.status(200).json(enrollments);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching enrollments",
            error: error.message
        });
    }
};

const getEnrollmentById = async (req, res) => {
    try {
        const isAdmin = req.user.role === "admin";

        const enrollment = await enrollmentModel.getEnrollmentById(
            req.params.id,
            req.user.userId,
            isAdmin
        );

        if (!enrollment) {
            return res.status(404).json({
                message: "Enrollment not found"
            });
        }

        res.status(200).json(enrollment);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching enrollment",
            error: error.message
        });
    }
};

const createEnrollment = async (req, res) => {
    try {
        const { student_id, course_id } = req.body;
        const isAdmin = req.user.role === "admin";

        let studentId;

        if (isAdmin) {
            studentId = student_id;
        } else {
            studentId = await enrollmentModel.getStudentIdByUserId(
                req.user.userId
            );
        }

        if (!studentId) {
            return res.status(404).json({
                message: "Student record not found for this user"
            });
        }

        if (!course_id) {
            return res.status(400).json({
                message: "course_id is required"
            });
        }

        const id = await enrollmentModel.createEnrollment(
            studentId,
            course_id
        );

        // LOG ACTIVITY
        await activityLogModel.logActivity(
            req.user.userId, "CREATE", "enrollment", `Course ID: ${course_id}`
        );

        return res.status(201).json({
            message: "Enrollment created successfully",
            id: id
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Student is already enrolled in this course"
            });
        }

        return res.status(500).json({
            message: "Error creating enrollment",
            error: error.message
        });
    }
};

const updateEnrollment = async (req, res) => {
    try {
        const { student_id, course_id } = req.body;

        const affectedRows = await enrollmentModel.updateEnrollment(
            req.params.id,
            student_id,
            course_id
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Enrollment not found"
            });
        }

        // LOG ACTIVITY
        await activityLogModel.logActivity(
            req.user.userId, "UPDATE", "enrollment", `Enrollment ID: ${req.params.id}`
        );

        res.status(200).json({
            message: "Enrollment updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating enrollment",
            error: error.message
        });
    }
};

const deleteEnrollment = async (req, res) => {
    try {
        const isAdmin = req.user.role === "admin";

        const affectedRows = await enrollmentModel.deleteEnrollment(
            req.params.id,
            req.user.userId,
            isAdmin
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Enrollment not found"
            });
        }

        // LOG ACTIVITY
        await activityLogModel.logActivity(
            req.user.userId, "DELETE", "enrollment", `Enrollment ID: ${req.params.id}`
        );

        return res.status(200).json({
            message: "Enrollment deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error deleting enrollment",
            error: error.message
        });
    }
};

module.exports = {
    getAllEnrollments,
    getEnrollmentById,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment
};