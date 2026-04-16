const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/settings/podcast-video
 * @desc    Get the monthly podcast video URL
 * @access  Public
 */
router.get('/podcast-video', settingController.getPodcastVideo);

/**
 * @route   POST /api/settings/podcast-video
 * @desc    Update the monthly podcast video URL
 * @access  Private (Admin)
 */
router.post('/podcast-video', verifyToken, settingController.updatePodcastVideo);

module.exports = router;
