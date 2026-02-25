const { pool } = require('../config/database.js');
const crypto = require('crypto');

const Branch = {
    getAll: async () => {
        const [rows] = await pool.query('SELECT * FROM branches ORDER BY name ASC');
        return rows;
    },

    getByDistrict: async (districtId) => {
        const [rows] = await pool.query('SELECT * FROM branches WHERE district_id = ? ORDER BY name ASC', [districtId]);
        return rows;
    },

    getHeadquarters: async () => {
        const [rows] = await pool.query('SELECT * FROM branches WHERE is_headquarters = TRUE LIMIT 1');
        return rows[0];
    },

    getById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM branches WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const id = crypto.randomUUID();
        const { district_id, name, address, map_url, pastor, phone, image_url, is_headquarters } = data;

        // Normalize boolean (FormData sends it as string "true"/"false")
        const normalizedHQ = (is_headquarters === 'true' || is_headquarters === true || is_headquarters === 1 || is_headquarters === '1') ? 1 : 0;

        await pool.query(
            `INSERT INTO branches (id, district_id, name, address, map_url, pastor, phone, image_url, is_headquarters) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, district_id || null, name, address, map_url || null, pastor, phone, image_url, normalizedHQ]
        );
        return id;
    },

    update: async (id, data) => {
        const { district_id, name, address, map_url, pastor, phone, image_url, is_headquarters } = data;

        // Normalize boolean (FormData sends it as string "true"/"false")
        const normalizedHQ = (is_headquarters === 'true' || is_headquarters === true || is_headquarters === 1 || is_headquarters === '1') ? 1 : 0;

        await pool.query(
            `UPDATE branches SET district_id = ?, name = ?, address = ?, map_url = ?, pastor = ?, phone = ?, image_url = ?, is_headquarters = ? 
             WHERE id = ?`,
            [district_id || null, name, address, map_url || null, pastor, phone, image_url, normalizedHQ, id]
        );
    },

    delete: async (id) => {
        await pool.query('DELETE FROM branches WHERE id = ?', [id]);
    }
};

module.exports = Branch;
