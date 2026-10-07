const courseModel = require("../models/courseModel");

const getCourses = async (req, res) => {
    try {
        const courses = await courseModel.getAllCourses();

        res.status(200).json(courses);
    } catch (error) {
        console.error("Error getting courses:", error.message);

        res.status(500).json({
            message: "Failed to get courses"
        });
    }
};
const getCourseById = async (req, res) => {
    try {
        const course = await courseModel.getCourseById(req.params.id);

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        res.status(200).json(course);
    } catch (error) {
        console.error("Error getting course:", error.message);

        res.status(500).json({
            message: "Failed to get course"
        });
    }
};
const createCourse = async (req, res) => {
    try {
        const {
            course_code,
            course_name,
            credit_hour,
            department_id
        } = req.body;

        if (!course_code || !course_name || !credit_hour || !department_id) {
            return res.status(400).json({
                message: "All course fields are required"
            });
        }

        const courseId = await courseModel.createCourse(
            course_code,
            course_name,
            credit_hour,
            department_id
        );

        res.status(201).json({
            message: "Course created successfully",
            id: courseId
        });
    } catch (error) {
        console.error("Error creating course:", error.message);

        res.status(500).json({
            message: "Failed to create course"
        });
    }
};
const updateCourse = async (req, res) => {
    try {
        const { course_code, course_name, credit_hour, department_id } = req.body;
        const { id } = req.params;

        if (!course_code || !course_name || !credit_hour || !department_id) {
            return res.status(400).json({
                message: "All course fields are required"
            });
        }

        const affectedRows = await courseModel.updateCourse(
            id,
            course_code,
            course_name,
            credit_hour,
            department_id
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        res.status(200).json({
            message: "Course updated successfully"
        });
    } catch (error) {
        console.error("Error updating course:", error.message);

        res.status(500).json({
            message: "Failed to update course"
        });
    }
};
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const affectedRows = await courseModel.deleteCourse(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        res.status(200).json({
            message: "Course deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting course:", error.message);

        res.status(500).json({
            message: "Failed to delete course"
        });
    }
};
module.exports = {
    getCourses,getCourseById,createCourse,updateCourse,deleteCourse
};