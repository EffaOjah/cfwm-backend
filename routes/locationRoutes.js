const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController.js');
const { upload } = require('../services/cloudinary');
const { verifyToken } = require('../middleware/authMiddleware');

// Districts
router.get('/districts', locationController.getDistrictsWithBranches);
router.post('/districts', verifyToken, locationController.createDistrict);
router.put('/districts/:id', verifyToken, locationController.updateDistrict);
router.delete('/districts/:id', verifyToken, locationController.deleteDistrict);

// Branches
router.get('/branches', locationController.getBranches);
router.get('/headquarters', locationController.getHeadquarters);
router.post('/branches', verifyToken, upload.single('image_url'), locationController.createBranch);
router.put('/branches/:id', verifyToken, upload.single('image_url'), locationController.updateBranch);
router.delete('/branches/:id', verifyToken, locationController.deleteBranch);


module.exports = router;
