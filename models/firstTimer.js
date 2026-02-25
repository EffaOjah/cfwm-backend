const { pool } = require('../config/database.js');
const crypto = require('crypto');

const FirstTimer = {
    getAll: async () => {
        const [rows] = await pool.query('SELECT * FROM first_timers ORDER BY created_at DESC');
        return rows;
    },

    getCount: async () => {
        const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM first_timers');
        return count;
    },

    getRecent: async (limit) => {
        const [rows] = await pool.query('SELECT * FROM first_timers ORDER BY created_at DESC LIMIT ?', [limit]);
        return rows;
    },

    create: async (data) => {
        const id = crypto.randomUUID();
        const { full_name, phone, email, address, how_heard, wants_visit } = data;

        // Normalize boolean
        const normalizedVisit = (wants_visit === 'true' || wants_visit === true || wants_visit === 1 || wants_visit === '1') ? 1 : 0;

        await pool.query(
            `INSERT INTO first_timers (id, full_name, phone, email, address, how_heard, wants_visit, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, full_name, phone, email, address, how_heard, normalizedVisit, 'Pending']
        );
        return id;
    },

    toggleStatus: async (id, status) => {
        await pool.query('UPDATE first_timers SET status = ? WHERE id = ?', [status, id]);
    },

    delete: async (id) => {
        await pool.query('DELETE FROM first_timers WHERE id = ?', [id]);
    }
};

module.exports = FirstTimer;
