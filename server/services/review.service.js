const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ReviewService {
  /**
   * Create a review for a completed order (Customer reviews Worker)
   * @param {number} orderId - The order ID
   * @param {number} reviewerId - The customer user ID
   * @param {number} rating - Rating 1-5
   * @param {string} comment - Review comment
   * @returns {Promise<Object>} The created review
   */
  async createReview(orderId, reviewerId, rating, comment) {
    // Get the order to verify it's completed and belongs to the reviewer (customer)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        job: true,
        user: true, // worker
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Verify the reviewer is the customer (job owner)
    if (order.job.createdUserId !== reviewerId) {
      throw new Error('Unauthorized: Only the customer can review this order');
    }

    // Verify order is completed
    if (order.status !== 'COMPLETED') {
      throw new Error('Can only review completed orders');
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: { orderId: orderId },
    });

    if (existingReview) {
      throw new Error('Review already exists for this order');
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        orderId,
        reviewerId,
        rating,
        comment,
        createdAt: new Date(),
      },
      include: {
        order: {
          include: {
            job: true,
            user: true, // worker
          },
        },
        reviewer: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          },
        },
      },
    });

    return review;
  }

  /**
   * Get all reviews received by a worker
   * @param {number} workerId - The worker user ID
   * @returns {Promise<Array>} Array of reviews
   */
  async getWorkerReviews(workerId) {
    const reviews = await prisma.review.findMany({
      where: {
        order: {
          userId: workerId, // orders where this user is the worker
        },
      },
      include: {
        order: {
          include: {
            job: true,
            user: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews;
  }

  /**
   * Get review for a specific order
   * @param {number} orderId - The order ID
   * @returns {Promise<Object|null>} The review or null
   */
  async getReviewByOrderId(orderId) {
    const review = await prisma.review.findFirst({
      where: { orderId },
      include: {
        order: {
          include: {
            job: true,
            user: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          },
        },
      },
    });

    return review;
  }

  /**
   * Add worker reply to a customer review
   * @param {number} reviewId - The review ID
   * @param {number} workerId - The worker user ID
   * @param {string} reply - The reply message
   * @returns {Promise<Object>} The updated review
   */
  async addWorkerReply(reviewId, workerId, reply) {
    // Get the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        order: {
          include: {
            user: true, // worker
          },
        },
      },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    // Verify the worker is the one being reviewed
    if (review.order.userId !== workerId) {
      throw new Error('Unauthorized: You can only reply to reviews about you');
    }

    // Check if reply already exists
    if (review.workerReply) {
      throw new Error('Reply already exists for this review');
    }

    // Update the review with worker reply
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        workerReply: reply,
        repliedAt: new Date(),
      },
      include: {
        order: {
          include: {
            job: true,
            user: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          },
        },
      },
    });

    return updatedReview;
  }

  /**
   * Get average rating for a worker
   * @param {number} workerId - The worker user ID
   * @returns {Promise<Object>} Average rating and count
   */
  async getWorkerAverageRating(workerId) {
    const result = await prisma.review.aggregate({
      where: {
        order: {
          userId: workerId,
        },
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      averageRating: result._avg.rating || 0,
      totalReviews: result._count.id || 0,
    };
  }
}

module.exports = new ReviewService();
