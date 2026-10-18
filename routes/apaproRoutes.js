const express = require('express');
const router = express.Router();
const apaproController = require('../controllers/apaproController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/', apaproController.getPublishedDevotionals);
router.get('/date/:date', apaproController.getDevotionalByDate);
router.get('/slug/:slug', apaproController.getDevotionalBySlug);

// OG image generator — returns a 1200×630 PNG for social link previews
router.get('/og-image/:slug', apaproController.getDevotionalOgImage);

// Share redirect page — serves OG-tagged HTML to crawlers, redirects real users to the SPA
router.get('/share/:slug', apaproController.getSharePage);

// Admin routes
router.get('/all', verifyToken, apaproController.getAllDevotionals);
router.post('/', verifyToken, apaproController.createDevotional);
router.put('/:id', verifyToken, apaproController.updateDevotional);
router.delete('/:id', verifyToken, apaproController.deleteDevotional);

// Fallback public route by slug (must come after specific routes)
router.get('/:slug', apaproController.getDevotionalBySlug);

module.exports = router;