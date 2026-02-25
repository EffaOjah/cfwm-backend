const express = require('express');
const router = express.Router();
const testimonyController = require('../controllers/testimonyController.js');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/', testimonyController.getApprovedTestimonies);
router.post('/', testimonyController.submitTestimony);

// Admin/Moderation routes
router.get('/all', verifyToken, testimonyController.getAllTestimonies);
router.get('/:id', verifyToken, testimonyController.getTestimony);
router.put('/:id', verifyToken, testimonyController.updateTestimony);
router.delete('/:id', verifyToken, testimonyController.deleteTestimony);

module.exports = router;
