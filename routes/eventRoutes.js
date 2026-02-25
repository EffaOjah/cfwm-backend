const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController.js');
const { upload } = require('../services/cloudinary.js');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEvent);
router.post('/', verifyToken, upload.single('image_url'), eventController.createEvent);
router.put('/:id', verifyToken, upload.single('image_url'), eventController.updateEvent);
router.delete('/:id', verifyToken, eventController.deleteEvent);

module.exports = router;
