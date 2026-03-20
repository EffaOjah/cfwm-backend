const { pool } = require('../config/database.js');
const crypto = require('crypto');

const EventRegistration = {
    /**
     * Get all event registrations
     * @returns {Promise<Array>}
     */
    getAll: async () => {
        try {
            const [rows] = await pool.query('SELECT * FROM event_registrations ORDER BY created_at DESC');
            return rows;
        } catch (error) {
            console.error('Error fetching event registrations:', error);
            throw error;
        }
    },

    /**
     * Create a new event registration
     * @param {Object} data - Registration data
     * @returns {Promise<string>} - The ID of the new registration
     */
    create: async (data) => {
        const id = crypto.randomUUID();
        const { full_name, phone, email, event_title } = data;

        try {
            await pool.query(
                'INSERT INTO event_registrations (id, full_name, phone, email, event_title) VALUES (?, ?, ?, ?, ?)',
                [id, full_name, phone, email || '', event_title]
            );
            return id;
        } catch (error) {
            console.error('Error creating event registration:', error);
            throw error;
        }
    },

    /**
     * Delete an event registration by ID
     * @param {string} id - The registration ID
     * @returns {Promise<void>}
     */
    delete: async (id) => {
        try {
            await pool.query('DELETE FROM event_registrations WHERE id = ?', [id]);
        } catch (error) {
            console.error('Error deleting event registration:', error);
            throw error;
        }
    }
};

module.exports = EventRegistration;
