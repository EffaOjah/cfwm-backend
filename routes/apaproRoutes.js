const express = require('express');
const router = express.Router();
const apaproController = require('../controllers/apaproController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/', apaproController.getPublishedDevotionals);
router.get('/date/:date', apaproController.getDevotionalByDate);

// Admin routes
router.get('/all', verifyToken, apaproController.getAllDevotionals);
router.post('/', verifyToken, apaproController.createDevotional);
router.put('/:id', verifyToken, apaproController.updateDevotional);
router.delete('/:id', verifyToken, apaproController.deleteDevotional);

module.exports = router;