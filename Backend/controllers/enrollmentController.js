const enrollmentModel = require("../models/enrollmentModel");

const getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await enrollmentModel.getAllEnrollments();

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
        const enrollment = await enrollmentModel.getEnrollmentById(req.params.id);

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

        const id = await enrollmentModel.createEnrollment(
            student_id,
            course_id
        );

        res.status(201).json({
            message: "Enrollment created successfully",
            id: id
        });
    } catch (error) {
        res.status(500).json({
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
        const affectedRows = await enrollmentModel.deleteEnrollment(
            req.params.id
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Enrollment not found"
            });
        }

        res.status(200).json({
            message: "Enrollment deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
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