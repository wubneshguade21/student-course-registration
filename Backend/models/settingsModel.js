const db = require("../db");   // ← ትክክለኛ path

const getSetting = async (key) => {
    const [rows] = await db.execute(
        "SELECT setting_value FROM settings WHERE setting_key = ?",
        [key]
    );
    return rows.length > 0 ? rows[0].setting_value : null;
};

const getAllSettings = async () => {
    const [rows] = await db.execute(
        "SELECT setting_key, setting_value FROM settings"
    );

    const settings = {};
    rows.forEach((row) => {
        settings[row.setting_key] = row.setting_value;
    });
    return settings;
};

const updateSetting = async (key, value) => {
    const [result] = await db.execute(
        `INSERT INTO settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value]
    );
    return result.affectedRows;
};

module.exports = {
    getSetting,
    getAllSettings,
    updateSetting
};