const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/signin', authController.signin);
router.post('/signup', authController.signup);

// Protected routes (authentication required)
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);

// Development only routes
router.post('/dev/test-password', authController.testPassword);
router.post('/dev/reset-password', authController.resetPassword);

module.exports = router;
