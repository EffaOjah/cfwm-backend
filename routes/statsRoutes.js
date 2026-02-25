const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController.js');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/overview', verifyToken, statsController.getDashboardOverview);

module.exports = router;
