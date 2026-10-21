const express = require("express");

const {
    registerUser,
    loginUser,
    changePassword,
    getMyPermissions,
    updateMyDepartment,
    updateMyProfile,
    resetStudentPassword,
    getSystemSettings,
    updateSystemSettings, 
    recoverAdminPassword,
    getActivities // <-- MUST BE IMPORTED HERE
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const passwordChangeMiddleware = require("../middleware/passwordChangeMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);

// Authenticated
router.post("/change-password", authMiddleware, changePassword);

router.get("/permissions", authMiddleware, passwordChangeMiddleware, getMyPermissions);

router.put("/department", authMiddleware, passwordChangeMiddleware, updateMyDepartment);

// ==================== SETTINGS ====================

router.put("/profile", authMiddleware, passwordChangeMiddleware, updateMyProfile);

router.post("/reset-password/:studentId", authMiddleware, passwordChangeMiddleware, permissionMiddleware("create_student"), resetStudentPassword);

router.get("/settings", authMiddleware, passwordChangeMiddleware, permissionMiddleware("create_student"), getSystemSettings);

router.put("/settings", authMiddleware, passwordChangeMiddleware, permissionMiddleware("create_student"), updateSystemSettings);

router.post("/recover-admin", recoverAdminPassword);

// ==================== ACTIVITIES ====================
// THIS MUST BE HERE AND EXACTLY SPELLED LIKE THIS:
router.get(
    "/activities", 
    authMiddleware, 
    passwordChangeMiddleware, 
    getActivities
);

module.exports = router;