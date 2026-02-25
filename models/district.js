const { pool } = require('../config/database.js');
const crypto = require('crypto');

const District = {
    getAll: async () => {
        const [rows] = await pool.query('SELECT * FROM districts ORDER BY name ASC');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM districts WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const id = crypto.randomUUID();
        const { name, head_pastor } = data;
        await pool.query(
            'INSERT INTO districts (id, name, head_pastor) VALUES (?, ?, ?)',
            [id, name, head_pastor]
        );
        return id;
    },

    update: async (id, data) => {
        const { name, head_pastor } = data;
        await pool.query(
            'UPDATE districts SET name = ?, head_pastor = ? WHERE id = ?',
            [name, head_pastor, id]
        );
    },

    delete: async (id) => {
        await pool.query('DELETE FROM districts WHERE id = ?', [id]);
    }
};

module.exports = District;
