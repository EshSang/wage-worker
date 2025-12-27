const reviewService = require('../services/review.service');
const notificationService = require('../services/notification.service');

class ReviewController {
  /**
   * Create a review (customer reviews completed order)
   * POST /api/reviews
   */
  async createReview(req, res) {
    try {
      const { orderId, rating, comment } = req.body;
      const reviewerId = req.user.id; // Customer ID

      // Validation
      if (!orderId || !rating || !comment) {
        return res.status(400).json({
          message: 'Order ID, rating, and comment are required',
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          message: 'Rating must be between 1 and 5',
        });
      }

      console.log(`[${new Date().toISOString()}] Creating review for order ${orderId} by user ${req.user.email}`);

      const review = await reviewService.createReview(
        parseInt(orderId),
        reviewerId,
        parseInt(rating),
        comment
      );

      console.log(`[${new Date().toISOString()}] Review created successfully - ID: ${review.id}`);

      // Send notification to the worker about receiving a review
      try {
        if (review.order && review.order.user && review.reviewer) {
          const worker = review.order.user;
          const customer = review.reviewer;
          const job = review.order.job;

          await notificationService.createNotification(
            worker.id,
            'REVIEW_RECEIVED',
            'New Review Received',
            `${customer.fname} ${customer.lname} reviewed you with ${rating} stars for "${job.title}"`,
            review.id,
            'REVIEW'
          );
          console.log(`[${new Date().toISOString()}] Notification sent to worker (User ID: ${worker.id})`);
        }
      } catch (notificationError) {
        console.error(`[${new Date().toISOString()}] Notification creation error:`, notificationError);
        // Continue even if notification fails - review is already created
      }

      res.status(201).json({
        message: 'Review submitted successfully',
        review,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Create review error:`, error);

      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }

      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ message: error.message });
      }

      if (error.message.includes('already exists') || error.message.includes('only review')) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({
        message: error.message || 'Failed to create review',
      });
    }
  }

  /**
   * Get reviews for a worker
   * GET /api/reviews/worker
   */
  async getWorkerReviews(req, res) {
    try {
      const workerId = req.user.id;

      console.log(`[${new Date().toISOString()}] Fetching reviews for worker ${req.user.email}`);

      const reviews = await reviewService.getWorkerReviews(workerId);
      const stats = await reviewService.getWorkerAverageRating(workerId);

      console.log(`[${new Date().toISOString()}] Found ${reviews.length} reviews for worker`);

      res.status(200).json({
        message: 'Reviews retrieved successfully',
        reviews,
        stats,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get worker reviews error:`, error);
      res.status(500).json({
        message: error.message || 'Failed to retrieve reviews',
      });
    }
  }

  /**
   * Get review for a specific order
   * GET /api/reviews/order/:orderId
   */
  async getReviewByOrderId(req, res) {
    try {
      const { orderId } = req.params;

      console.log(`[${new Date().toISOString()}] Fetching review for order ${orderId}`);

      const review = await reviewService.getReviewByOrderId(parseInt(orderId));

      res.status(200).json({
        message: review ? 'Review found' : 'No review found',
        review,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get review by order error:`, error);
      res.status(500).json({
        message: error.message || 'Failed to retrieve review',
      });
    }
  }

  /**
   * Add worker reply to a review
   * PATCH /api/reviews/:reviewId/reply
   */
  async addWorkerReply(req, res) {
    try {
      const { reviewId } = req.params;
      const { reply } = req.body;
      const workerId = req.user.id;

      // Validation
      if (!reply || reply.trim().length === 0) {
        return res.status(400).json({
          message: 'Reply message is required',
        });
      }

      console.log(`[${new Date().toISOString()}] Adding reply to review ${reviewId} by worker ${req.user.email}`);

      const updatedReview = await reviewService.addWorkerReply(
        parseInt(reviewId),
        workerId,
        reply
      );

      console.log(`[${new Date().toISOString()}] Reply added successfully to review ${reviewId}`);

      res.status(200).json({
        message: 'Reply added successfully',
        review: updatedReview,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Add worker reply error:`, error);

      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }

      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ message: error.message });
      }

      if (error.message.includes('already exists')) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({
        message: error.message || 'Failed to add reply',
      });
    }
  }
}

module.exports = new ReviewController();
