const apaproModel = require('../models/apaproModel');
const { apaproSchema } = require('../services/validation');
const logger = require('../services/logger');
const { generateOgImage } = require('../services/ogImageGenerator');

// PUBLIC: Get all published devotionals for dates <= today
const getPublishedDevotionals = async (req, res) => {
    try {
        const devotionals = await apaproModel.getPublished();
        res.status(200).json({ status: 'success', data: devotionals });
    } catch (error) {
        console.error('getPublishedDevotionals error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch devotionals.' });
    }
};

// PUBLIC: Get single devotional by date
const getDevotionalByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const devotional = await apaproModel.getByDate(date);
        if (!devotional) {
            return res.status(404).json({ status: 'error', message: 'No devotional found for this date.' });
        }
        res.status(200).json({ status: 'success', data: devotional });
    } catch (error) {
        console.error('getDevotionalByDate error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch devotional.' });
    }
};

// PUBLIC: Get single devotional by slug
const getDevotionalBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const devotional = await apaproModel.getBySlug(slug);
        if (!devotional) {
            return res.status(404).json({ status: 'error', message: 'No devotional found for this slug.' });
        }
        res.status(200).json({ status: 'success', data: devotional });
    } catch (error) {
        console.error('getDevotionalBySlug error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch devotional.' });
    }
};

// ADMIN: Get all devotionals (all statuses)
const getAllDevotionals = async (req, res) => {
    try {
        const devotionals = await apaproModel.getAll();
        res.status(200).json({ status: 'success', data: devotionals });
    } catch (error) {
        console.error('getAllDevotionals error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch devotionals.' });
    }
};

// ADMIN: Create devotional
const createDevotional = async (req, res) => {
    try {
        const { error, value } = apaproSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 'error', message: error.details[0].message });
        }

        const result = await apaproModel.create(value);
        res.status(201).json({ status: 'success', message: 'Devotional created.', id: result });
    } catch (error) {
        console.error('createDevotional error:', error);
        res.status(500).json({ status: 'error', message: error.message || 'Failed to create devotional.' });
    }
};

// ADMIN: Update devotional
const updateDevotional = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = apaproSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 'error', message: error.details[0].message });
        }

        const existing = await apaproModel.getById(id);
        if (!existing) {
            return res.status(404).json({ status: 'error', message: 'Devotional not found.' });
        }
        await apaproModel.update(id, value);
        res.status(200).json({ status: 'success', message: 'Devotional updated.' });
    } catch (error) {
        console.error('updateDevotional error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update devotional.' });
    }
};

// ADMIN: Delete devotional
const deleteDevotional = async (req, res) => {
    try {
        const { id } = req.params;
        await apaproModel.delete(id);
        res.status(200).json({ status: 'success', message: 'Devotional deleted.' });
    } catch (error) {
        console.error('deleteDevotional error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete devotional.' });
    }
};

// PUBLIC: Generate OG preview image for a devotional by slug
const getDevotionalOgImage = async (req, res) => {
    try {
        const { slug } = req.params;
        const devotional = await apaproModel.getBySlug(slug);
        if (!devotional) {
            return res.status(404).json({ status: 'error', message: 'Devotional not found.' });
        }
        const imageBuffer = await generateOgImage(devotional);
        res.set({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400', // cache for 24 hours
        });
        res.send(imageBuffer);
    } catch (error) {
        console.error('getDevotionalOgImage error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to generate image.' });
    }
};

// PUBLIC: Share redirect page — returns HTML with OG tags for social crawlers,
// then JS-redirects real users to the SPA.
const getSharePage = async (req, res) => {
    try {
        const { slug } = req.params;
        const devotional = await apaproModel.getBySlug(slug);

        const BASE_URL   = process.env.BASE_URL   || 'https://cfwmintl.com';
        const API_URL    = process.env.API_URL     || `${BASE_URL}/api`;
        const spaUrl     = `${BASE_URL}/apapro/${encodeURIComponent(slug)}`;
        const ogImageUrl = `${API_URL}/apapro/og-image/${encodeURIComponent(slug)}`;

        if (!devotional) {
            return res.redirect(302, spaUrl);
        }

        const title       = devotional.title || 'APAPRO Devotional';
        const description = devotional.quote
            ? devotional.quote.substring(0, 200)
            : 'Apostolic and Prophetic Daily Devotional — Christ for the World Mission';

        const dateStr = devotional.date
            ? new Date(String(devotional.date).replace(/-/g, '/')).toLocaleDateString('en-US', {
                  day: 'numeric', month: 'long', year: 'numeric',
              })
            : '';

        const fullTitle = dateStr ? `${title} | ${dateStr} — APAPRO` : `${title} — APAPRO`;

        // Override CSP for this route only: allow inline scripts for the redirect
        res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';");
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escHtml(fullTitle)}</title>
  <meta name="description" content="${escHtml(description)}" />

  <!-- Open Graph -->
  <meta property="og:type"        content="article" />
  <meta property="og:url"         content="${escHtml(spaUrl)}" />
  <meta property="og:title"       content="${escHtml(fullTitle)}" />
  <meta property="og:description" content="${escHtml(description)}" />
  <meta property="og:image"       content="${escHtml(ogImageUrl)}" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name"   content="CFWM — Christ for the World Mission" />

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:url"         content="${escHtml(spaUrl)}" />
  <meta name="twitter:title"       content="${escHtml(fullTitle)}" />
  <meta name="twitter:description" content="${escHtml(description)}" />
  <meta name="twitter:image"       content="${escHtml(ogImageUrl)}" />

  <!-- WhatsApp / iMessage -->
  <meta property="og:image:secure_url" content="${escHtml(ogImageUrl)}" />

  <!-- Redirect real users to the SPA immediately -->
  <meta http-equiv="refresh" content="0;url=${escHtml(spaUrl)}" />
  <script>window.location.replace(${JSON.stringify(spaUrl)});</script>
</head>
<body style="font-family:sans-serif;background:#1a0205;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
  <p>Redirecting to devotional…</p>
</body>
</html>`);
    } catch (error) {
        console.error('getSharePage error:', error);
        res.status(500).send('Internal Server Error');
    }
};

/** Escape HTML special characters to prevent XSS in the server-rendered page */
function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

module.exports = {
    getPublishedDevotionals,
    getDevotionalByDate,
    getDevotionalBySlug,
    getDevotionalOgImage,
    getSharePage,
    getAllDevotionals,
    createDevotional,
    updateDevotional,
    deleteDevotional,
};