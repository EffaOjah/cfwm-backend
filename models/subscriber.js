const { pool } = require('../config/database.js');
const crypto = require('crypto');

const Subscriber = {
    create: async (email) => {
        const id = crypto.randomUUID();
        await pool.query(
            'INSERT INTO subscribers (id, email) VALUES (?, ?)',
            [id, email]
        );
        return id;
    },

    getByEmail: async (email) => {
        const [rows] = await pool.query('SELECT * FROM subscribers WHERE email = ?', [email]);
        return rows[0];
    },

    getAll: async () => {
        const [rows] = await pool.query('SELECT * FROM subscribers ORDER BY created_at DESC');
        return rows;
    },

    deleteById: async (id) => {
        await pool.query('DELETE FROM subscribers WHERE id = ?', [id]);
    },

    unsubscribe: async (email) => {
        await pool.query('UPDATE subscribers SET status = "unsubscribed" WHERE email = ?', [email]);
    },

    activate: async (email) => {
        await pool.query('UPDATE subscribers SET status = "active" WHERE email = ?', [email]);
    }
};

module.exports = Subscriber;
