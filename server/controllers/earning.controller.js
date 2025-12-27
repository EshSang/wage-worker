const earningService = require('../services/earning.service');

class EarningController {
  /**
   * Get worker earnings with summary
   * GET /api/earnings/worker
   */
  async getWorkerEarnings(req, res) {
    try {
      const workerId = req.user.id;
      const { startDate, endDate, status } = req.query;

      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (status) filters.status = status;

      const [earnings, summary] = await Promise.all([
        earningService.getWorkerEarnings(workerId, filters),
        earningService.getWorkerEarningsSummary(workerId),
      ]);

      res.status(200).json({
        message: 'Earnings retrieved successfully',
        summary,
        earnings,
      });
    } catch (error) {
      console.error('Get worker earnings error:', error);
      res.status(500).json({
        message: error.message || 'Failed to retrieve earnings',
      });
    }
  }

  /**
   * Get worker earnings by month
   * GET /api/earnings/worker/monthly?year=2025
   */
  async getWorkerEarningsByMonth(req, res) {
    try {
      const workerId = req.user.id;
      const year = req.query.year ? parseInt(req.query.year) : undefined;

      const monthlyEarnings = await earningService.getWorkerEarningsByMonth(
        workerId,
        year
      );

      res.status(200).json({
        message: 'Monthly earnings retrieved successfully',
        monthlyBreakdown: monthlyEarnings,
        year: year || new Date().getFullYear(),
      });
    } catch (error) {
      console.error('Get monthly earnings error:', error);
      res.status(500).json({
        message: error.message || 'Failed to retrieve monthly earnings',
      });
    }
  }

  /**
   * Get worker earnings by category
   * GET /api/earnings/worker/by-category
   */
  async getWorkerEarningsByCategory(req, res) {
    try {
      const workerId = req.user.id;

      const categoryEarnings = await earningService.getWorkerEarningsByCategory(
        workerId
      );

      res.status(200).json({
        message: 'Category earnings retrieved successfully',
        categories: categoryEarnings,
      });
    } catch (error) {
      console.error('Get category earnings error:', error);
      res.status(500).json({
        message: error.message || 'Failed to retrieve category earnings',
      });
    }
  }

  /**
   * Get customer payments
   * GET /api/earnings/customer
   */
  async getCustomerPayments(req, res) {
    try {
      const customerId = req.user.id;
      const { startDate, endDate } = req.query;

      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const payments = await earningService.getCustomerPayments(
        customerId,
        filters
      );

      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

      res.status(200).json({
        message: 'Payments retrieved successfully',
        summary: {
          totalPaid: Math.round(totalPaid),
          totalJobs: payments.length,
        },
        payments,
      });
    } catch (error) {
      console.error('Get customer payments error:', error);
      res.status(500).json({
        message: error.message || 'Failed to retrieve payments',
      });
    }
  }
}

module.exports = new EarningController();
