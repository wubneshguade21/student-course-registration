
const express = require("express");

const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");
const passwordChangeMiddleware = require("../middleware/passwordChangeMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("view_students"),
    studentController.getStudents
);

router.get(
    "/:id",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("view_students"),
    studentController.getStudentById
);

router.post(
    "/",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("create_student"),
    studentController.createStudent
);

router.put(
    "/:id",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("update_student"),
    studentController.updateStudent
);

router.delete(
    "/:id",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("delete_student"),
    studentController.deleteStudent
);

module.exports = router;
