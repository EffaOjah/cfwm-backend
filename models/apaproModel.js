const crypto = require('crypto');
const db = require('../config/database');
const { slugify } = require('../utils/slugify');

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
    // Generate unique slug for devotional
    generateUniqueSlug: async (titleOrSlug, date = null, excludeId = null) => {
        let baseSlug = slugify(titleOrSlug);
        if (!baseSlug) {
            baseSlug = `devotional-${date || Date.now()}`;
        }
        let candidate = baseSlug;
        let counter = 1;

        while (true) {
            let query = `SELECT id FROM apapro_devotionals WHERE slug = ?`;
            const params = [candidate];
            if (excludeId) {
                query += ` AND id != ?`;
                params.push(excludeId);
            }
            const [rows] = await db.pool.query(query, params);
            if (rows.length === 0) {
                return candidate;
            }
            candidate = `${baseSlug}-${counter}`;
            counter++;
        }
    },

    // Get all devotionals (admin — all statuses)
    // We use DATE_FORMAT to prevent the driver from converting dates to UTC/ISO strings
    getAll: async () => {
        const [rows] = await db.pool.query(
            `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, title, slug, subtitle, quote, scripture, scripture_ref, 
                    content, prophetic, confession, further_study, bible_plan, declaration, declaration_ref, status, created_at
             FROM apapro_devotionals 
             ORDER BY date DESC`
        );
        return rows.map(parseJSONFields);
    },

    // Get published devotionals whose date <= today (public)
    getPublished: async () => {
        const [rows] = await db.pool.query(
            `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, title, slug, subtitle, quote, scripture, scripture_ref, 
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
            `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, title, slug, subtitle, quote, scripture, scripture_ref, 
                    content, prophetic, confession, further_study, bible_plan, declaration, declaration_ref, status, created_at
             FROM apapro_devotionals
             WHERE date = ? AND status = 'published'`,
            [date]
        );
        return rows[0] ? parseJSONFields(rows[0]) : null;
    },

    // Get a single published devotional by slug (public)
    getBySlug: async (slug) => {
        const [rows] = await db.pool.query(
            `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, title, slug, subtitle, quote, scripture, scripture_ref, 
                    content, prophetic, confession, further_study, bible_plan, declaration, declaration_ref, status, created_at
             FROM apapro_devotionals
             WHERE slug = ? AND status = 'published'`,
            [slug]
        );
        return rows[0] ? parseJSONFields(rows[0]) : null;
    },

    // Get a single devotional by ID (admin)
    getById: async (id) => {
        const [rows] = await db.pool.query(
            `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, title, slug, subtitle, quote, scripture, scripture_ref, 
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

        const slugInput = data.slug ? slugify(data.slug) : title;
        const slug = await apaproModel.generateUniqueSlug(slugInput, date);

        await db.pool.query(
            `INSERT INTO apapro_devotionals
             (id, date, title, slug, subtitle, quote, scripture, scripture_ref,
              content, prophetic, confession, further_study,
              bible_plan, declaration, declaration_ref, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, date, title, slug, subtitle || null, quote, scripture, scripture_ref,
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

        let slug = data.slug ? slugify(data.slug) : undefined;
        if (!slug && title) {
            const existing = await apaproModel.getById(id);
            if (!existing?.slug) {
                slug = await apaproModel.generateUniqueSlug(title, date, id);
            } else {
                slug = existing.slug;
            }
        } else if (slug) {
            slug = await apaproModel.generateUniqueSlug(slug, date, id);
        }

        await db.pool.query(
            `UPDATE apapro_devotionals SET
             date=?, title=?, slug=?, subtitle=?, quote=?, scripture=?, scripture_ref=?,
             content=?, prophetic=?, confession=?, further_study=?,
             bible_plan=?, declaration=?, declaration_ref=?, status=?
             WHERE id=?`,
            [
                date, title, slug || null, subtitle || null, quote, scripture, scripture_ref,
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