const express = require("express");

const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, studentController.getStudents);

router.get("/:id", authMiddleware, studentController.getStudentById);

router.post("/", authMiddleware, studentController.createStudent);

router.put("/:id", authMiddleware, studentController.updateStudent);

router.delete("/:id", authMiddleware, studentController.deleteStudent);

module.exports = router;