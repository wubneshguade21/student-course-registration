const express = require("express");

const departmentController = require("../controllers/departmentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, departmentController.getDepartments);

router.post("/", authMiddleware, departmentController.createDepartment);

router.get("/:id", authMiddleware, departmentController.getDepartmentById);

router.put("/:id", authMiddleware, departmentController.updateDepartment);

router.delete("/:id", authMiddleware, departmentController.deleteDepartment);

module.exports = router;