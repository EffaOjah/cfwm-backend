const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController.js');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/first-timer', formController.submitFirstTimer);
router.post('/prayer-request', formController.submitPrayerRequest);

// Admin routes
router.get('/first-timers', verifyToken, formController.getFirstTimers);
router.patch('/first-timers/:id/status', verifyToken, formController.toggleFirstTimerStatus);
router.delete('/first-timers/:id', verifyToken, formController.deleteFirstTimer);
router.get('/prayer-requests', verifyToken, formController.getPrayerRequests);
router.patch('/prayer-requests/:id/status', verifyToken, formController.togglePrayerRequestStatus);
router.delete('/prayer-requests/:id', verifyToken, formController.deletePrayerRequest);

module.exports = router;
