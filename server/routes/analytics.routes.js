const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/analytics/worker
 * @desc    Get worker analytics data with charts and metrics
 * @access  Private (Worker)
 * @query   startDate - Optional start date filter (YYYY-MM-DD)
 * @query   endDate - Optional end date filter (YYYY-MM-DD)
 */
router.get('/worker', analyticsController.getWorkerAnalytics);

/**
 * @route   GET /api/analytics/worker/report
 * @desc    Download worker analytics report
 * @access  Private (Worker)
 * @query   format - Report format: 'csv' or 'json' (default: csv)
 * @query   startDate - Optional start date filter (YYYY-MM-DD)
 * @query   endDate - Optional end date filter (YYYY-MM-DD)
 */
router.get('/worker/report', analyticsController.downloadWorkerReport);

/**
 * @route   GET /api/analytics/customer
 * @desc    Get customer analytics data with charts and metrics
 * @access  Private (Customer)
 * @query   startDate - Optional start date filter (YYYY-MM-DD)
 * @query   endDate - Optional end date filter (YYYY-MM-DD)
 */
router.get('/customer', analyticsController.getCustomerAnalytics);

/**
 * @route   GET /api/analytics/customer/report
 * @desc    Download customer analytics report
 * @access  Private (Customer)
 * @query   format - Report format: 'csv' or 'json' (default: csv)
 * @query   startDate - Optional start date filter (YYYY-MM-DD)
 * @query   endDate - Optional end date filter (YYYY-MM-DD)
 */
router.get('/customer/report', analyticsController.downloadCustomerReport);

module.exports = router;
