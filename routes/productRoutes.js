const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController.js');
const { upload } = require('../services/cloudinary.js');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Admin routes
router.post('/', verifyToken, upload.single('image_url'), productController.createProduct);
router.put('/:id', verifyToken, upload.single('image_url'), productController.updateProduct);
router.delete('/:id', verifyToken, productController.deleteProduct);

module.exports = router;
