const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin.middleware');

// All payment routes require authentication
router.use(authMiddleware);

// Create payment intent for job acceptance
router.post('/create-intent', paymentController.createPaymentIntent);

// Create payment intent for direct hire request
router.post('/create-direct-hire-intent', paymentController.createDirectHirePaymentIntent);

// Verify payment (optional - for debugging)
router.post('/verify', paymentController.verifyPayment);

// Refund payment (admin only)
router.post('/refund', isAdmin, paymentController.refundPayment);

module.exports = router;
