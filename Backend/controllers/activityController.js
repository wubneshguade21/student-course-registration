const activityLogModel = require("../models/activityLogModel");

const getActivities = async (req, res) => {
    try {
        const activities = await activityLogModel.getRecentActivities(50);
        res.status(200).json(activities);
    } catch (error) {
        console.error("Error fetching activities:", error.message);
        res.status(500).json({ message: "Failed to fetch activities" });
    }
};

module.exports = { getActivities };