const express = require("express");
const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");
const passwordChangeMiddleware = require("../middleware/passwordChangeMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const router = express.Router();

router.get("/",authMiddleware, passwordChangeMiddleware, permissionMiddleware("view_courses"),courseController.getCourses);
router.get("/:id", authMiddleware, passwordChangeMiddleware,permissionMiddleware("view_courses"),courseController.getCourseById);
router.post("/", authMiddleware, passwordChangeMiddleware,permissionMiddleware("create_course"),courseController.createCourse);
router.put("/:id", authMiddleware, passwordChangeMiddleware,permissionMiddleware("update_course"),courseController.updateCourse);
router.delete("/:id",authMiddleware, passwordChangeMiddleware,permissionMiddleware("delete_course"), courseController.deleteCourse);

module.exports = router;