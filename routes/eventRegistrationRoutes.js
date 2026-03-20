const express = require('express');
const router = express.Router();
const eventRegistrationController = require('../controllers/eventRegistrationController.js');
const { verifyToken } = require('../middleware/authMiddleware');

// Public route for event registration
router.post('/', eventRegistrationController.registerEvent);

// Admin route to get all registrations
router.get('/', verifyToken, eventRegistrationController.getRegistrations);

// Admin route to delete a registration
router.delete('/:id', verifyToken, eventRegistrationController.deleteRegistration);

module.exports = router;
