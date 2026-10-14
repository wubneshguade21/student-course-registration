const departmentModel = require("../models/departmentModel");

const getDepartments = async (req, res) => {
    try {
        const departments = await departmentModel.getAllDepartments();

        res.status(200).json(departments);
    } catch (error) {
        console.error("Error getting departments:", error.message);

        res.status(500).json({
            message: "Failed to get departments"
        });
    }
};
const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Department name is required"
            });
        }

        const departmentId = await departmentModel.createDepartment(name);

        res.status(201).json({
            message: "Department created successfully",
            id: departmentId
        });
    } catch (error) {
        console.error("Error creating department:", error.message);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This department already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create department"
        });
    }
};
const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await departmentModel.getDepartmentById(id);

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        res.status(200).json(department);
    } catch (error) {
        console.error("Error getting department:", error.message);

        res.status(500).json({
            message: "Failed to get department"
        });
    }
};
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Department name is required"
            });
        }

        const affectedRows = await departmentModel.updateDepartment(
            id,
            name
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        res.status(200).json({
            message: "Department updated successfully"
        });
    } catch (error) {
        console.error("Error updating department:", error.message);

        res.status(500).json({
            message: "Failed to update department"
        });
    }
};
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const affectedRows = await departmentModel.deleteDepartment(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        res.status(200).json({
            message: "Department deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting department:", error.message);

        res.status(500).json({
            message: "Failed to delete department"
        });
    }
};
module.exports = {
    getDepartments, createDepartment, getDepartmentById,updateDepartment, deleteDepartment
};