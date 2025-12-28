const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin.middleware');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(isAdmin);

// User management routes
router.get('/users/statistics', adminController.getUserStatistics);
router.get('/users/:userId', adminController.getUserById);
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;
