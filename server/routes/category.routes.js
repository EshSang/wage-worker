const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const verifyToken = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin.middleware');

// All category routes require authentication
router.use(verifyToken);

// Get all categories (available to all authenticated users)
router.get('/', categoryController.getAllCategories);

// Admin-only routes for category management
router.post('/', isAdmin, categoryController.createCategory);
router.put('/:categoryId', isAdmin, categoryController.updateCategory);
router.delete('/:categoryId', isAdmin, categoryController.deleteCategory);

module.exports = router;
