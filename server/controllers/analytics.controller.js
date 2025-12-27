const analyticsService = require('../services/analytics.service');

class AnalyticsController {
  /**
   * Get worker analytics data
   * GET /api/analytics/worker?startDate=...&endDate=...
   */
  async getWorkerAnalytics(req, res) {
    try {
      const workerId = req.user.id;
      const { startDate, endDate } = req.query;

      console.log(`[${new Date().toISOString()}] Fetching analytics for worker ${req.user.email}`);

      const dateRange = {};
      if (startDate) dateRange.startDate = startDate;
      if (endDate) dateRange.endDate = endDate;

      const analytics = await analyticsService.getWorkerAnalytics(workerId, dateRange);

      res.status(200).json({
        message: 'Analytics retrieved successfully',
        data: analytics,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get analytics error:`, error);
      res.status(500).json({
        message: error.message || 'Failed to retrieve analytics',
      });
    }
  }

  /**
   * Download worker report
   * GET /api/analytics/worker/report?format=csv&startDate=...&endDate=...
   */
  async downloadWorkerReport(req, res) {
    try {
      const workerId = req.user.id;
      const { format = 'csv', startDate, endDate } = req.query;

      console.log(
        `[${new Date().toISOString()}] Generating ${format} report for worker ${req.user.email}`
      );

      const dateRange = {};
      if (startDate) dateRange.startDate = startDate;
      if (endDate) dateRange.endDate = endDate;

      const reportData = await analyticsService.generateWorkerReport(
        workerId,
        format,
        dateRange
      );

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="worker-analytics-${new Date().toISOString().split('T')[0]}.csv"`
        );
        res.send(reportData);
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="worker-analytics-${new Date().toISOString().split('T')[0]}.json"`
        );
        res.json(reportData);
      } else {
        res.status(400).json({
          message: 'Invalid format. Supported formats: csv, json',
        });
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Download report error:`, error);
      res.status(500).json({
        message: error.message || 'Failed to generate report',
      });
    }
  }

  /**
   * Get customer analytics data
   * GET /api/analytics/customer?startDate=...&endDate=...
   */
  async getCustomerAnalytics(req, res) {
    try {
      const customerId = req.user.id;
      const { startDate, endDate } = req.query;

      console.log(`[${new Date().toISOString()}] Fetching analytics for customer ${req.user.email}`);

      const dateRange = {};
      if (startDate) dateRange.startDate = startDate;
      if (endDate) dateRange.endDate = endDate;

      const analytics = await analyticsService.getCustomerAnalytics(customerId, dateRange);

      res.status(200).json({
        message: 'Analytics retrieved successfully',
        data: analytics,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get customer analytics error:`, error);
      res.status(500).json({
        message: error.message || 'Failed to retrieve analytics',
      });
    }
  }

  /**
   * Download customer report
   * GET /api/analytics/customer/report?format=csv&startDate=...&endDate=...
   */
  async downloadCustomerReport(req, res) {
    try {
      const customerId = req.user.id;
      const { format = 'csv', startDate, endDate } = req.query;

      console.log(
        `[${new Date().toISOString()}] Generating ${format} report for customer ${req.user.email}`
      );

      const dateRange = {};
      if (startDate) dateRange.startDate = startDate;
      if (endDate) dateRange.endDate = endDate;

      const reportData = await analyticsService.generateCustomerReport(
        customerId,
        format,
        dateRange
      );

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="customer-analytics-${new Date().toISOString().split('T')[0]}.csv"`
        );
        res.send(reportData);
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="customer-analytics-${new Date().toISOString().split('T')[0]}.json"`
        );
        res.json(reportData);
      } else {
        res.status(400).json({
          message: 'Invalid format. Supported formats: csv, json',
        });
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Download customer report error:`, error);
      res.status(500).json({
        message: error.message || 'Failed to generate report',
      });
    }
  }
}

module.exports = new AnalyticsController();
