const { pool } = require('../config/database.js');

const Moment = {
    /**
     * Fetch up to 6 most-recent moments.
     */
    getAll: async () => {
        const [rows] = await pool.query(
            'SELECT id, image_url, type, link, created_at FROM moments ORDER BY created_at DESC LIMIT 6'
        );
        return rows;
    },

    /**
     * Replace the entire gallery.
     * 1. Fetch existing image paths (so the controller can delete files).
     * 2. Delete all rows.
     * 3. Bulk-insert the new records.
     *
     * @param {Array<{image_url, type, link}>} records
     * @returns {string[]} old image paths that should be deleted from disk
     */
    replaceAll: async (records) => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Grab existing image URLs before wiping
            const [existing] = await conn.query('SELECT image_url FROM moments');
            const oldPaths = existing.map(r => r.image_url);

            // Clear the table
            await conn.query('DELETE FROM moments');

            // Insert new batch (if any)
            if (records.length > 0) {
                const values = records.map(r => [r.image_url, r.type, r.link || null]);
                await conn.query(
                    'INSERT INTO moments (image_url, type, link) VALUES ?',
                    [values]
                );
            }

            await conn.commit();
            return oldPaths;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    /**
     * Delete a single moment by ID.
     * @param {number|string} id 
     * @returns {string|null} The image_url of the deleted moment, or null if not found.
     */
    deleteById: async (id) => {
        // First get the image_url so we can delete from Cloudinary
        const [rows] = await pool.query('SELECT image_url FROM moments WHERE id = ?', [id]);
        if (rows.length === 0) return null;

        const imageUrl = rows[0].image_url;
        await pool.query('DELETE FROM moments WHERE id = ?', [id]);
        return imageUrl;
    }
};

module.exports = Moment;
