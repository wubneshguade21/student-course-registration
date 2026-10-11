
const express = require("express");

const departmentController = require("../controllers/departmentController");
const authMiddleware = require("../middleware/authMiddleware");
const passwordChangeMiddleware = require("../middleware/passwordChangeMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("view_departments"),
    departmentController.getDepartments
);

router.get(
    "/:id",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("view_departments"),
    departmentController.getDepartmentById
);

router.post(
    "/",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("create_department"),
    departmentController.createDepartment
);

router.put(
    "/:id",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("update_department"),
    departmentController.updateDepartment
);

router.delete(
    "/:id",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("delete_department"),
    departmentController.deleteDepartment
);

module.exports = router;