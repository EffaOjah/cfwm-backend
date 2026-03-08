const express = require('express');
const router = express.Router();
const multer = require('multer');
const momentController = require('../controllers/momentController');
const { verifyToken } = require('../middleware/authMiddleware');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB per file
});

// GET  /api/moments  — Public
router.get('/', momentController.getMoments);

// POST /api/moments  — Admin (replaces entire gallery)
router.post('/', verifyToken, upload.any(), momentController.replaceMoments);

// DELETE /api/moments/:id — Admin only
router.delete('/:id', verifyToken, momentController.deleteMoment);

module.exports = router;
