const crypto = require('crypto');
const db = require('../config/database');

const parseJSONFields = (row) => {
    if (!row) return null;
    const parsed = { ...row };
    if (typeof parsed.content === 'string') {
        try {
            parsed.content = JSON.parse(parsed.content);
        } catch (e) {
            parsed.content = [parsed.content];
        }
    }
    if (typeof parsed.further_study === 'string') {
        try {
            parsed.further_study = JSON.parse(parsed.further_study);
        } catch (e) {
            parsed.further_study = parsed.further_study.split(',').map(s => s.trim()).filter(Boolean);
        }
    }
    return parsed;
};

const apaproModel = {
    // Get all devotionals (admin — all statuses)
    // We use DATE_FORMAT to prevent the driver from converting dates to UTC/ISO strings
    getAll: async () => {
        const [rows] = await db.pool.query(
            `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, title, subtitle, quote, scripture, scripture_ref, 
                    content, prophetic, confession, further_study, bible_plan, declaration, declaration_ref, status, created_at
             FROM apapro_devotionals 
             ORDER BY date DESC`
        );
        return rows.map(parseJSONFields);
    },

    // Get published devotionals whose date <= today (public)
    getPublished: async () => {
        const [rows] = await db.pool.query(
            `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, title, subtitle, quote, scripture, scripture_ref, 
                    content, prophetic, confession, further_study, bible_plan, declaration, declaration_ref, status, created_at
             FROM apapro_devotionals
             WHERE status = 'published' AND date <= CURDATE()
             ORDER BY date DESC`
        );
        return rows.map(parseJSONFields);
    },

    // Get a single published devotional by date (public)
    getByDate: async (date) => {
        const [rows] = await db.pool.query(
            `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, title, subtitle, quote, scripture, scripture_ref, 
                    content, prophetic, confession, further_study, bible_plan, declaration, declaration_ref, status, created_at
             FROM apapro_devotionals
             WHERE date = ? AND status = 'published'`,
            [date]
        );
        return rows[0] ? parseJSONFields(rows[0]) : null;
    },

    // Get a single devotional by ID (admin)
    getById: async (id) => {
        const [rows] = await db.pool.query(
            `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, title, subtitle, quote, scripture, scripture_ref, 
                    content, prophetic, confession, further_study, bible_plan, declaration, declaration_ref, status, created_at
             FROM apapro_devotionals 
             WHERE id = ?`,
            [id]
        );
        return rows[0] ? parseJSONFields(rows[0]) : null;
    },

    // Create a new devotional
    create: async (data) => {
        const id = crypto.randomUUID();
        const {
            date, title, subtitle, quote, scripture, scripture_ref,
            content, prophetic, confession, further_study,
            bible_plan, declaration, declaration_ref, status
        } = data;

        await db.pool.query(
            `INSERT INTO apapro_devotionals
             (id, date, title, subtitle, quote, scripture, scripture_ref,
              content, prophetic, confession, further_study,
              bible_plan, declaration, declaration_ref, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, date, title, subtitle || null, quote, scripture, scripture_ref,
                JSON.stringify(content), prophetic, confession, JSON.stringify(further_study),
                bible_plan || null, declaration || null, declaration_ref || null,
                status || 'draft'
            ]
        );
        return id;
    },

    // Update an existing devotional
    update: async (id, data) => {
        const {
            date, title, subtitle, quote, scripture, scripture_ref,
            content, prophetic, confession, further_study,
            bible_plan, declaration, declaration_ref, status
        } = data;

        await db.pool.query(
            `UPDATE apapro_devotionals SET
             date=?, title=?, subtitle=?, quote=?, scripture=?, scripture_ref=?,
             content=?, prophetic=?, confession=?, further_study=?,
             bible_plan=?, declaration=?, declaration_ref=?, status=?
             WHERE id=?`,
            [
                date, title, subtitle || null, quote, scripture, scripture_ref,
                JSON.stringify(content), prophetic, confession, JSON.stringify(further_study),
                bible_plan || null, declaration || null, declaration_ref || null,
                status || 'draft', id
            ]
        );
    },

    // Delete a devotional
    delete: async (id) => {
        await db.pool.query('DELETE FROM apapro_devotionals WHERE id = ?', [id]);
    },
};

module.exports = apaproModel;