const studentModel = require("../models/studentModel");

const getStudents = async (req, res) => {
    try {
        const students = await studentModel.getAllStudents();

        res.status(200).json(students);
    } catch (error) {
        console.error("Error getting students:", error.message);

        res.status(500).json({
            message: "Failed to get students"
        });
    }
};

const getStudentById = async (req, res) => {
    try {
        const student = await studentModel.getStudentById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json(student);
    } catch (error) {
        console.error("Error getting student:", error.message);

        res.status(500).json({
            message: "Failed to get student"
        });
    }
};
const createStudent = async (req, res) => {
    try {
        const { name, email, department_id } = req.body;

        if (!name || !email || !department_id) {
            return res.status(400).json({
                message: "Name, email and department_id are required"
            });
        }

        const studentId = await studentModel.createStudent(
            name,
            email,
            department_id
        );

        res.status(201).json({
            message: "Student created successfully",
            id: studentId
        });
    } catch (error) {
        console.error("Error creating student:", error.message);

        res.status(500).json({
            message: "Failed to create student"
        });
    }
};
const updateStudent = async (req, res) => {
    try {
        const { name, email, department_id } = req.body;
        const { id } = req.params;

        if (!name || !email || !department_id) {
            return res.status(400).json({
                message: "Name, email and department_id are required"
            });
        }

        const affectedRows = await studentModel.updateStudent(
            id,
            name,
            email,
            department_id
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student updated successfully"
        });
    } catch (error) {
        console.error("Error updating student:", error.message);

        res.status(500).json({
            message: "Failed to update student"
        });
    }
};
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const affectedRows = await studentModel.deleteStudent(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting student:", error.message);

        res.status(500).json({
            message: "Failed to delete student"
        });
    }
};
module.exports = {
    getStudents,getStudentById,createStudent,updateStudent,deleteStudent
};