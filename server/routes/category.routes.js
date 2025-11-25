const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const verifyToken = require('../middleware/auth');

// All category routes require authentication
router.use(verifyToken);

// Get all categories
router.get('/', categoryController.getAllCategories);

// Create a new category (admin only - add admin middleware later if needed)
router.post('/', categoryController.createCategory);

// Update a category (admin only - add admin middleware later if needed)
router.put('/:categoryId', categoryController.updateCategory);

// Delete a category (admin only - add admin middleware later if needed)
router.delete('/:categoryId', categoryController.deleteCategory);

module.exports = router;
