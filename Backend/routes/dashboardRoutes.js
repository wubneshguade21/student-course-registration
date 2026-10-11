
const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const passwordChangeMiddleware = require("../middleware/passwordChangeMiddleware");

router.get(
    "/",
    authMiddleware,
    passwordChangeMiddleware,
    dashboardController.getDashboardStats
);

module.exports = router;