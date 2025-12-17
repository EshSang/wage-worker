const jobService = require('../services/job.service');
const prisma = require('../config/prisma');

class WorkerReviewController {
  /**
   * Get all reviews
   */
  async getReviews(req, res) {
    try {
      console.log(`[${new Date().toISOString()}] Fetching all jobs - User: ${req.user.email} (ID: ${req.user.id})`);

      const jobs = await jobService.getReviews();

      console.log(`[${new Date().toISOString()}] Found ${jobs.length} jobs`);

      res.json({
        message: "Jobs fetched successfully",
        jobs
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get all jobs error:`, error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }
}


module.exports = new WorkerReviewController();