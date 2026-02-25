const { pool } = require('../config/database.js');
const crypto = require('crypto');

const Sermon = {
    getAll: async (type = null, search = '') => {
        let sql = 'SELECT * FROM sermons';
        const params = [];
        const conditions = [];

        if (type && type !== 'all') {
            conditions.push('type = ?');
            params.push(type);
        }

        if (search) {
            conditions.push('(title LIKE ? OR speaker LIKE ? OR series LIKE ?)');
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY sermon_date DESC';
        const [rows] = await pool.query(sql, params);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM sermons WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (sermonData) => {
        const id = crypto.randomUUID();
        const {
            title, speaker, series, description, sermon_date,
            duration, type, video_url, audio_url, thumbnail_url
        } = sermonData;

        await pool.query(
            `INSERT INTO sermons (
                id, title, speaker, series, description, sermon_date, 
                duration, type, video_url, audio_url, thumbnail_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, title, speaker, series, description, sermon_date,
                duration, type, video_url, audio_url, thumbnail_url
            ]
        );
        return id;
    },

    update: async (id, sermonData) => {
        const {
            title, speaker, series, description, sermon_date,
            duration, type, video_url, audio_url, thumbnail_url
        } = sermonData;

        await pool.query(
            `UPDATE sermons SET 
                title = ?, speaker = ?, series = ?, description = ?, sermon_date = ?, 
                duration = ?, type = ?, video_url = ?, audio_url = ?, thumbnail_url = ?
            WHERE id = ?`,
            [
                title, speaker, series, description, sermon_date,
                duration, type, video_url, audio_url, thumbnail_url, id
            ]
        );
    },

    delete: async (id) => {
        await pool.query('DELETE FROM sermons WHERE id = ?', [id]);
    },

    getCount: async () => {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM sermons');
        return rows[0].count;
    },

    getRecent: async (limit = 3) => {
        const [rows] = await pool.query('SELECT * FROM sermons ORDER BY created_at DESC LIMIT ?', [limit]);
        return rows;
    }
};

module.exports = Sermon;
