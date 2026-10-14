const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const passwordChangeMiddleware = require("../middleware/passwordChangeMiddleware");
router.get(
    "/me",
    authMiddleware,
    passwordChangeMiddleware,
    dashboardController.getMyDashboardStats
);
router.get(
    "/",
    authMiddleware,
    passwordChangeMiddleware,
    dashboardController.getDashboardStats
);

module.exports = router;