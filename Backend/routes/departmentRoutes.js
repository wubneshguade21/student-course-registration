const express = require("express");
const departmentController = require("../controllers/departmentController");

const router = express.Router();

router.get("/", departmentController.getDepartments);
router.post("/", departmentController.createDepartment);
router.get("/:id", departmentController.getDepartmentById);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;