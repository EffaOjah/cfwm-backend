const { pool } = require('../config/database.js');

const Livestream = {
    getSettings: async () => {
        const [rows] = await pool.query('SELECT * FROM livestream_settings WHERE id = 1');
        return rows[0];
    },

    updateSettings: async (data) => {
        const { next_title, next_scheduled_at, next_video_url, is_live, prev_title, prev_video_url, prev_date } = data;

        // We use a single record with ID 1 for global settings
        await pool.query(
            `UPDATE livestream_settings SET 
                next_title = ?, 
                next_scheduled_at = ?, 
                next_video_url = ?, 
                is_live = ?, 
                prev_title = ?, 
                prev_video_url = ?, 
                prev_date = ? 
            WHERE id = 1`,
            [next_title, next_scheduled_at, next_video_url, is_live ? 1 : 0, prev_title, prev_video_url, prev_date]
        );
        return true;
    }
};

module.exports = Livestream;
