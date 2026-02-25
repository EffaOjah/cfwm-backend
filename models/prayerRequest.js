const { pool } = require('../config/database.js');
const crypto = require('crypto');

const PrayerRequest = {
    getAll: async () => {
        const [rows] = await pool.query('SELECT * FROM prayer_requests ORDER BY created_at DESC');
        return rows;
    },

    getCount: async () => {
        const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM prayer_requests');
        return count;
    },

    getRecent: async (limit) => {
        const [rows] = await pool.query('SELECT * FROM prayer_requests ORDER BY created_at DESC LIMIT ?', [limit]);
        return rows;
    },

    create: async (data) => {
        const id = crypto.randomUUID();
        const { name, phone, topic, request_details, is_confidential } = data;

        // Normalize boolean
        const normalizedConfidential = (is_confidential === 'true' || is_confidential === true || is_confidential === 1 || is_confidential === '1') ? 1 : 0;

        await pool.query(
            `INSERT INTO prayer_requests (id, name, phone, topic, request_details, is_confidential, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, name, phone, topic, request_details, normalizedConfidential, 'Pending']
        );
        return id;
    },

    toggleStatus: async (id, status) => {
        await pool.query('UPDATE prayer_requests SET status = ? WHERE id = ?', [status, id]);
    },

    delete: async (id) => {
        await pool.query('DELETE FROM prayer_requests WHERE id = ?', [id]);
    }
};

module.exports = PrayerRequest;
