const { pool } = require('../config/database.js');
const crypto = require('crypto');

const Event = {
    getAll: async () => {
        const [rows] = await pool.query('SELECT * FROM events ORDER BY event_date ASC');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (eventData) => {
        const id = crypto.randomUUID();
        const { title, subtitle, description, highlights, event_date, event_time, location, organizer, category, status, image_url } = eventData;
        await pool.query(
            'INSERT INTO events (id, title, subtitle, description, highlights, event_date, event_time, location, organizer, category, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, title, subtitle, description, highlights, event_date, event_time, location, organizer, category, status || 'published', image_url]
        );
        return id;
    },

    update: async (id, eventData) => {
        const { title, subtitle, description, highlights, event_date, event_time, location, organizer, category, status, image_url } = eventData;
        await pool.query(
            'UPDATE events SET title = ?, subtitle = ?, description = ?, highlights = ?, event_date = ?, event_time = ?, location = ?, organizer = ?, category = ?, status = ?, image_url = ? WHERE id = ?',
            [title, subtitle, description, highlights, event_date, event_time, location, organizer, category, status, image_url, id]
        );
    },

    delete: async (id) => {
        await pool.query('DELETE FROM events WHERE id = ?', [id]);
    },

    getCount: async () => {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM events');
        return rows[0].count;
    },

    getRecent: async (limit = 3) => {
        const [rows] = await pool.query('SELECT * FROM events ORDER BY created_at DESC LIMIT ?', [limit]);
        return rows;
    }
};

module.exports = Event;
