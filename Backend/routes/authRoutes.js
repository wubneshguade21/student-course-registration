const express = require("express");

const {
    registerUser,
    loginUser,
    changePassword,
    getMyPermissions,
    updateMyDepartment
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const passwordChangeMiddleware = require("../middleware/passwordChangeMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/change-password", authMiddleware, changePassword);

router.get(
    "/permissions",
    authMiddleware,
    passwordChangeMiddleware,
    getMyPermissions
);

router.put(
    "/department",
    authMiddleware,
    passwordChangeMiddleware,
    updateMyDepartment
);

module.exports = router;