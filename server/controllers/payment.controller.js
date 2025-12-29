const paymentService = require('../services/payment.service');

class PaymentController {
  /**
   * POST /api/payments/create-intent
   * Create payment intent for job acceptance
   */
  async createPaymentIntent(req, res) {
    try {
      const { applicationId } = req.body;
      const userId = req.user.id;

      console.log(`[${new Date().toISOString()}] Create payment intent request - Application: ${applicationId}, User: ${req.user.email}`);

      if (!applicationId) {
        return res.status(400).json({
          success: false,
          message: 'Application ID is required',
        });
      }

      const paymentIntent = await paymentService.createPaymentIntent(
        parseInt(applicationId),
        userId
      );

      console.log(`[${new Date().toISOString()}] Payment intent created successfully`);

      res.status(200).json({
        success: true,
        message: 'Payment intent created successfully',
        data: paymentIntent,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Create payment intent error:`, error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create payment intent',
      });
    }
  }

  /**
   * POST /api/payments/create-direct-hire-intent
   * Create payment intent for direct hire request
   */
  async createDirectHirePaymentIntent(req, res) {
    try {
      const { workerId, jobData } = req.body;
      const customerId = req.user.id;

      console.log(`[${new Date().toISOString()}] Create direct hire payment intent - Worker: ${workerId}, Customer: ${req.user.email}`);

      if (!workerId || !jobData) {
        return res.status(400).json({
          success: false,
          message: 'Worker ID and job data are required',
        });
      }

      const paymentIntent = await paymentService.createDirectHirePaymentIntent(
        parseInt(workerId),
        customerId,
        jobData
      );

      console.log(`[${new Date().toISOString()}] Direct hire payment intent created successfully`);

      res.status(200).json({
        success: true,
        message: 'Payment intent created successfully',
        data: paymentIntent,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Create direct hire payment intent error:`, error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create payment intent',
      });
    }
  }

  /**
   * POST /api/payments/verify
   * Verify payment status (optional - for debugging)
   */
  async verifyPayment(req, res) {
    try {
      const { paymentIntentId } = req.body;

      console.log(`[${new Date().toISOString()}] Verify payment request - Payment Intent: ${paymentIntentId}`);

      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: 'Payment Intent ID is required',
        });
      }

      const verification = await paymentService.verifyPayment(paymentIntentId);

      console.log(`[${new Date().toISOString()}] Payment verified successfully`);

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: verification,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Verify payment error:`, error);
      res.status(400).json({
        success: false,
        message: error.message || 'Payment verification failed',
      });
    }
  }

  /**
   * POST /api/payments/refund
   * Create refund for a payment (admin only)
   */
  async refundPayment(req, res) {
    try {
      const { paymentIntentId, reason } = req.body;

      console.log(`[${new Date().toISOString()}] Refund payment request - Payment Intent: ${paymentIntentId}, User: ${req.user.email}`);

      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: 'Payment Intent ID is required',
        });
      }

      const refund = await paymentService.refundPayment(paymentIntentId, reason);

      console.log(`[${new Date().toISOString()}] Refund created successfully`);

      res.status(200).json({
        success: true,
        message: 'Refund created successfully',
        data: refund,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Refund payment error:`, error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create refund',
      });
    }
  }
}

module.exports = new PaymentController();
