
const express = require("express");

const router = express.Router();

const enrollmentController = require("../controllers/enrollmentController");
const authMiddleware = require("../middleware/authMiddleware");
const passwordChangeMiddleware = require("../middleware/passwordChangeMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

router.get(
    "/",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("view_enrollments"),
    enrollmentController.getAllEnrollments
);

router.get(
    "/:id",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("view_enrollments"),
    enrollmentController.getEnrollmentById
);

router.post(
    "/",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("create_enrollment"),
    enrollmentController.createEnrollment
);

router.put(
    "/:id",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("update_enrollment"),
    enrollmentController.updateEnrollment
);

router.delete(
    "/:id",
    authMiddleware,
    passwordChangeMiddleware,
    permissionMiddleware("delete_enrollment"),
    enrollmentController.deleteEnrollment
);

module.exports = router;