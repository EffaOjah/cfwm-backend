const { pool } = require('../config/database.js');

const Setting = {
    /**
     * Get a setting by its key
     * @param {string} key 
     * @returns {Promise<string|null>}
     */
    getSetting: async (key) => {
        const [rows] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
        return rows.length > 0 ? rows[0].setting_value : null;
    },

    /**
     * Create or update a setting
     * @param {string} key 
     * @param {string} value 
     * @returns {Promise<boolean>}
     */
    upsertSetting: async (key, value) => {
        await pool.query(
            'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [key, value, value]
        );
        return true;
    }
};

module.exports = Setting;
