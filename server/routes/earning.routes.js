const express = require('express');
const router = express.Router();
const earningController = require('../controllers/earning.controller');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/earnings/worker
 * @desc    Get worker earnings summary and detailed list
 * @access  Private (Worker)
 */
router.get('/worker', earningController.getWorkerEarnings);

/**
 * @route   GET /api/earnings/worker/monthly
 * @desc    Get worker earnings by month
 * @access  Private (Worker)
 */
router.get('/worker/monthly', earningController.getWorkerEarningsByMonth);

/**
 * @route   GET /api/earnings/worker/by-category
 * @desc    Get worker earnings by job category
 * @access  Private (Worker)
 */
router.get('/worker/by-category', earningController.getWorkerEarningsByCategory);

/**
 * @route   GET /api/earnings/customer
 * @desc    Get customer payments
 * @access  Private (Customer)
 */
router.get('/customer', earningController.getCustomerPayments);

module.exports = router;
