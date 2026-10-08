const express = require("express");
const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/",authMiddleware, courseController.getCourses);
router.get("/:id", authMiddleware,courseController.getCourseById);
router.post("/", authMiddleware,courseController.createCourse);
router.put("/:id", authMiddleware,courseController.updateCourse);
router.delete("/:id",authMiddleware, courseController.deleteCourse);

module.exports = router;