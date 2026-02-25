const { pool } = require('../config/database.js');
const crypto = require('crypto');

const Testimony = {
    getAllApproved: async () => {
        const [rows] = await pool.query('SELECT * FROM testimonies WHERE status = "approved" ORDER BY created_at DESC');
        return rows;
    },

    getAll: async () => {
        const [rows] = await pool.query('SELECT * FROM testimonies ORDER BY created_at DESC');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM testimonies WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (testimonyData) => {
        const id = crypto.randomUUID();
        const { name, content } = testimonyData;
        await pool.query(
            'INSERT INTO testimonies (id, name, content, status) VALUES (?, ?, ?, "pending")',
            [id, name, content]
        );
        return id;
    },

    update: async (id, testimonyData) => {
        const { name, content, status } = testimonyData;
        await pool.query(
            'UPDATE testimonies SET name = ?, content = ?, status = ? WHERE id = ?',
            [name, content, status, id]
        );
    },

    delete: async (id) => {
        await pool.query('DELETE FROM testimonies WHERE id = ?', [id]);
    },

    getCount: async () => {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM testimonies');
        return rows[0].count;
    },

    getCountByMonth: async (year, month) => {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM testimonies WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?',
            [year, month]
        );
        return rows[0].count;
    },

    getRecent: async (limit = 5) => {
        const [rows] = await pool.query('SELECT * FROM testimonies ORDER BY created_at DESC LIMIT ?', [limit]);
        return rows;
    }
};

module.exports = Testimony;
