const express = require("express");

const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const passwordChangeMiddleware = require("../middleware/passwordChangeMiddleware");


const router = express.Router();

router.get("/", authMiddleware,passwordChangeMiddleware, studentController.getStudents);

router.get("/:id", authMiddleware, passwordChangeMiddleware,studentController.getStudentById);
router.post( "/", authMiddleware,passwordChangeMiddleware, permissionMiddleware("create_student"), studentController.createStudent
);
router.put("/:id", authMiddleware, passwordChangeMiddleware, studentController.updateStudent);

router.delete("/:id", authMiddleware, passwordChangeMiddleware, studentController.deleteStudent);

module.exports = router;