const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController.js');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/subscribe', newsletterController.subscribe);
router.get('/subscribers', verifyToken, newsletterController.getSubscribers);
router.post('/unsubscribe', newsletterController.unsubscribe);
router.delete('/subscriber/:id', verifyToken, newsletterController.remove);

module.exports = router;
