//const jobService = require('../services/job.service');
const prisma = require('../config/prisma');

const customerPostedJobsService = require('../services/customerpostedjobs.service');

class CustomerPostedJobsController {
  /**
   * Get all jobs posted by the authenticated customer  
   * 
   * Assumes req.user contains authenticated user info
   * 
   * Returns jobs created by the current user
   */
  async getAllCustomerPostedJobs(req, res) {
    try {
      console.log(`[${new Date().toISOString()}] Fetching posted jobs for user: ${req.user.email} (ID: ${req.user.id})`);  

      const postedJobs = await customerPostedJobsService.getAllCustomerPostedJobs(req.user.id);

      res.json(postedJobs);
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error fetching posted jobs:`, error);
      res.status(500).json({ error: 'Failed to fetch posted jobs' });
    }
  }         
}

module.exports = new CustomerPostedJobsController();