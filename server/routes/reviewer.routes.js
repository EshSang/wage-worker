const express = require('express');
const router = express.Router();
const reviewerController = require('../controllers/reviewer.controller');
const authenticateToken = require('../middleware/auth');
const { isReviewer } = require('../middleware/reviewerMiddleware');

// Apply authentication and reviewer middleware to all routes
router.use(authenticateToken);
router.use(isReviewer);

// Dashboard routes
router.get('/dashboard/statistics', reviewerController.getDashboardStatistics);

// Order routes
router.get('/orders', reviewerController.getAllOrders);

// Job routes
router.get('/jobs/pending', reviewerController.getPendingJobs);
router.get('/jobs', reviewerController.getAllJobs);
router.put('/jobs/:jobId/approve', reviewerController.approveJob);
router.put('/jobs/:jobId/reject', reviewerController.rejectJob);

// Review routes
router.get('/reviews/pending', reviewerController.getPendingReviews);
router.get('/reviews', reviewerController.getAllReviews);
router.put('/reviews/:reviewId/approve', reviewerController.approveReview);
router.put('/reviews/:reviewId/reject', reviewerController.rejectReview);

// Report routes
router.get('/reports/yearly', reviewerController.getYearlyReport);
router.get('/reports/download/:format', reviewerController.downloadReport);

module.exports = router;
