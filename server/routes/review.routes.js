const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/reviews
 * @desc    Create a review (customer reviews completed order)
 * @access  Private (Customer)
 */
router.post('/', reviewController.createReview);

/**
 * @route   GET /api/reviews/worker
 * @desc    Get all reviews for the current worker
 * @access  Private (Worker)
 */
router.get('/worker', reviewController.getWorkerReviews);

/**
 * @route   GET /api/reviews/order/:orderId
 * @desc    Get review for a specific order
 * @access  Private
 */
router.get('/order/:orderId', reviewController.getReviewByOrderId);

/**
 * @route   PATCH /api/reviews/:reviewId/reply
 * @desc    Add worker reply to a review
 * @access  Private (Worker)
 */
router.patch('/:reviewId/reply', reviewController.addWorkerReply);

module.exports = router;
