const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = require('../config/prisma');

class PaymentService {
  /**
   * Create a payment intent for job acceptance
   * @param {number} applicationId - Job application ID
   * @param {number} userId - Customer user ID
   * @returns {Promise<Object>} Payment intent with client secret
   */
  async createPaymentIntent(applicationId, userId) {
    console.log(`[${new Date().toISOString()}] Creating payment intent - Application: ${applicationId}, User: ${userId}`);

    // Get application details
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            category: true,
          },
        },
        user: true, // Worker
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Verify user is the job owner
    if (application.job.createdUserId !== userId) {
      throw new Error('Unauthorized: Only job owner can make payment');
    }

    // Verify application is approved
    if (application.applicationStatus !== 'APPROVED') {
      throw new Error('Can only pay for approved applications');
    }

    // Check if order already exists for this application
    const existingOrder = await prisma.order.findFirst({
      where: { jobApplicationId: applicationId },
    });

    if (existingOrder) {
      throw new Error('Order already exists for this application');
    }

    // Calculate amount (hourly rate in LKR, convert to cents/smallest unit)
    const amount = Math.round(application.job.hourlyRate * 100);

    console.log(`[${new Date().toISOString()}] Creating Stripe payment intent - Amount: ${amount} cents (LKR ${application.job.hourlyRate})`);

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'lkr', // Sri Lankan Rupee
      metadata: {
        applicationId: applicationId.toString(),
        jobId: application.job.id.toString(),
        workerId: application.userId.toString(),
        customerId: userId.toString(),
        jobTitle: application.job.title,
        workerName: `${application.user.fname} ${application.user.lname}`,
      },
      description: `Payment for ${application.job.title} - ${application.user.fname} ${application.user.lname}`,
    });

    console.log(`[${new Date().toISOString()}] Payment intent created - ID: ${paymentIntent.id}`);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: application.job.hourlyRate,
    };
  }

  /**
   * Verify payment intent is successful
   * @param {string} paymentIntentId - Stripe Payment Intent ID
   * @returns {Promise<Object>} Payment verification result
   */
  async verifyPayment(paymentIntentId) {
    try {
      console.log(`[${new Date().toISOString()}] Verifying payment - Intent ID: ${paymentIntentId}`);

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      console.log(`[${new Date().toISOString()}] Payment status: ${paymentIntent.status}`);

      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment not completed. Status: ${paymentIntent.status}`);
      }

      return {
        verified: true,
        amount: paymentIntent.amount / 100, // Convert back from cents
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Payment verification error:`, error);
      throw new Error('Payment verification failed: ' + error.message);
    }
  }

  /**
   * Create a payment intent for direct hire request
   * @param {number} workerId - Worker user ID
   * @param {number} customerId - Customer user ID
   * @param {Object} jobData - Job details (title, hourlyRate, categoryId)
   * @returns {Promise<Object>} Payment intent with client secret
   */
  async createDirectHirePaymentIntent(workerId, customerId, jobData) {
    console.log(`[${new Date().toISOString()}] Creating direct hire payment intent - Worker: ${workerId}, Customer: ${customerId}`);

    // Get worker details
    const worker = await prisma.user.findUnique({
      where: { id: workerId },
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        usertype: true,
      },
    });

    if (!worker || worker.usertype !== 'USER') {
      throw new Error('Invalid worker');
    }

    // Get category details
    const category = await prisma.jobCategory.findUnique({
      where: { id: jobData.categoryId },
    });

    if (!category) {
      throw new Error('Invalid category');
    }

    // Calculate amount (hourly rate in LKR, convert to cents/smallest unit)
    const amount = Math.round(jobData.hourlyRate * 100);

    console.log(`[${new Date().toISOString()}] Creating Stripe payment intent for direct hire - Amount: ${amount} cents (LKR ${jobData.hourlyRate})`);

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'lkr', // Sri Lankan Rupee
      metadata: {
        workerId: workerId.toString(),
        customerId: customerId.toString(),
        jobTitle: jobData.title,
        workerName: `${worker.fname} ${worker.lname}`,
        categoryId: jobData.categoryId.toString(),
        categoryName: category.category,
        requestType: 'DIRECT_HIRE',
      },
      description: `Direct hire payment for ${jobData.title} - ${worker.fname} ${worker.lname}`,
    });

    console.log(`[${new Date().toISOString()}] Direct hire payment intent created - ID: ${paymentIntent.id}`);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: jobData.hourlyRate,
    };
  }

  /**
   * Create refund for a payment
   * @param {string} paymentIntentId - Stripe Payment Intent ID
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} Refund result
   */
  async refundPayment(paymentIntentId, reason = 'requested_by_customer') {
    try {
      console.log(`[${new Date().toISOString()}] Creating refund - Payment Intent: ${paymentIntentId}, Reason: ${reason}`);

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: reason,
      });

      console.log(`[${new Date().toISOString()}] Refund created - ID: ${refund.id}, Status: ${refund.status}`);

      return {
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount / 100,
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Refund error:`, error);
      throw new Error('Refund failed: ' + error.message);
    }
  }
}

module.exports = new PaymentService();
