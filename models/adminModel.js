const db = require('../config/database');
const crypto = require('crypto');

const AdminModel = {
    findByUsername: async (username) => {
        const [rows] = await db.pool.query(
            'SELECT * FROM admins WHERE username = ?',
            [username]
        );
        return rows[0];
    },

    findById: async (id) => {
        const [rows] = await db.pool.query(
            'SELECT * FROM admins WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    create: async (data) => {
        const id = crypto.randomUUID();
        const { username, password, full_name } = data;
        await db.pool.query(
            'INSERT INTO admins (id, username, password, full_name) VALUES (?, ?, ?, ?)',
            [id, username, password, full_name]
        );
        return id;
    }
};

module.exports = AdminModel;
