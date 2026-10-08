const express = require("express");
const router = express.Router();

const enrollmentController = require("../controllers/enrollmentController");
const authMiddleware = require("../middleware/authMiddleware");
router.get("/",authMiddleware, enrollmentController.getAllEnrollments);
router.get("/:id",authMiddleware, enrollmentController.getEnrollmentById);
router.post("/", authMiddleware,enrollmentController.createEnrollment);
router.put("/:id",authMiddleware, enrollmentController.updateEnrollment);
router.delete("/:id",authMiddleware, enrollmentController.deleteEnrollment);
module.exports = router;