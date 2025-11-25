const applicationService = require('../services/application.service');

class ApplicationController {
  /**
   * Submit a new job application
   */
  async submitApplication(req, res) {
    try {
      const { jobId } = req.body;
      const userId = req.user.id;

      // Validation
      if (!jobId) {
        return res.status(400).json({ message: 'Job ID is required' });
      }

      console.log(`[${new Date().toISOString()}] User ${req.user.email} applying to job ${jobId}`);

      // Check if user has already applied
      const existingApplication = await applicationService.checkExistingApplication(userId, parseInt(jobId));

      if (existingApplication) {
        return res.status(400).json({ message: 'You have already applied to this job' });
      }

      // Create application
      const application = await applicationService.createApplication({
        jobId: parseInt(jobId),
        userId: userId,
        appliedDate: new Date(),
        applicationStatus: 'Pending'
      });

      console.log(`[${new Date().toISOString()}] Application created successfully - ID: ${application.id}`);

      res.status(201).json({
        message: "Application submitted successfully",
        application
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Submit application error:`, error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Get applications for a specific job (customer/job poster view)
   */
  async getJobApplications(req, res) {
    try {
      const { jobId } = req.params;

      console.log(`[${new Date().toISOString()}] Fetching applications for job ${jobId}`);

      const applications = await applicationService.getApplicationsByJobId(parseInt(jobId));

      console.log(`[${new Date().toISOString()}] Found ${applications.length} applications for job ${jobId}`);

      res.json({
        message: "Applications fetched successfully",
        applications
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get job applications error:`, error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Get all applications submitted by the current user (worker view)
   */
  async getMyApplications(req, res) {
    try {
      const userId = req.user.id;

      console.log(`[${new Date().toISOString()}] Fetching applications for user ${req.user.email}`);

      const applications = await applicationService.getApplicationsByUserId(userId);

      console.log(`[${new Date().toISOString()}] Found ${applications.length} applications for user ${req.user.email}`);

      res.json({
        message: "Applications fetched successfully",
        applications
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get my applications error:`, error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Get all applications for jobs posted by current user (customer view)
   */
  async getApplicationsForMyJobs(req, res) {
    try {
      const userId = req.user.id;

      console.log(`[${new Date().toISOString()}] Fetching applications for jobs posted by ${req.user.email} (ID: ${userId})`);

      const applications = await applicationService.getApplicationsForUserJobs(userId);

      console.log(`[${new Date().toISOString()}] Found ${applications.length} applications for jobs by ${req.user.email}`);

      res.json({
        message: "Applications fetched successfully",
        applications
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get applications for my jobs error:`, error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Update application status (customer only)
   */
  async updateApplicationStatus(req, res) {
    try {
      const { applicationId } = req.params;
      const { status } = req.body;

      // Validation
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Withdrawn'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      console.log(`[${new Date().toISOString()}] Updating application ${applicationId} status to ${status}`);

      const updatedApplication = await applicationService.updateApplicationStatus(
        parseInt(applicationId),
        status
      );

      console.log(`[${new Date().toISOString()}] Application updated successfully - ID: ${applicationId}`);

      res.json({
        message: "Application status updated successfully",
        application: updatedApplication
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Update application status error:`, error);

      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Application not found' });
      }

      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Delete/withdraw an application
   */
  async deleteApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const userId = req.user.id;

      console.log(`[${new Date().toISOString()}] Deleting application ${applicationId} by user ${req.user.email}`);

      // Get application to verify ownership
      const application = await applicationService.getApplicationById(parseInt(applicationId));

      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      if (application.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized to delete this application' });
      }

      await applicationService.deleteApplication(parseInt(applicationId));

      console.log(`[${new Date().toISOString()}] Application deleted successfully - ID: ${applicationId}`);

      res.json({
        message: "Application deleted successfully"
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Delete application error:`, error);

      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Application not found' });
      }

      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }
}

module.exports = new ApplicationController();
