const express = require('express');
const router = express.Router();
const sermonController = require('../controllers/sermonController.js');
const { upload } = require('../services/cloudinary');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/', sermonController.getSermons);
router.get('/:id', sermonController.getSermon);

// Admin routes
router.post('/', verifyToken, upload.single('thumbnail_url'), sermonController.createSermon);
router.put('/:id', verifyToken, upload.single('thumbnail_url'), sermonController.updateSermon);
router.delete('/:id', verifyToken, sermonController.deleteSermon);

module.exports = router;
