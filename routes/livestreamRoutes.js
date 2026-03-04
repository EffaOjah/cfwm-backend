const express = require('express');
const router = express.Router();
const livestreamController = require('../controllers/livestreamController');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/livestream/status - Public
router.get('/status', livestreamController.getStatus);

// POST /api/livestream/update - Admin only
router.post('/update', verifyToken, livestreamController.updateSettings);

module.exports = router;
