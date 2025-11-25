const jobService = require('../services/job.service');
const prisma = require('../config/prisma');

class JobController {
  /**
   * Get all available jobs
   */
  async getAllJobs(req, res) {
    try {
      console.log(`[${new Date().toISOString()}] Fetching all jobs - User: ${req.user.email} (ID: ${req.user.id})`);

      const jobs = await jobService.getAllJobs();

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

  /**
   * Create a new job posting
   */
  async createJob(req, res) {
    // Start a transaction for data consistency
    try {
      const {
        title,
        description,
        categoryId,
        skills,
        location,
        hourlyRate
      } = req.body;

      // Validation
      if (!title || !description || !categoryId || !skills || !location || !hourlyRate) {
        return res.status(400).json({
          message: 'Required fields: title, description, categoryId, skills, location, hourlyRate'
        });
      }

      console.log(`[${new Date().toISOString()}] Creating job - User: ${req.user.email} (ID: ${req.user.id})`);
      console.log(`[${new Date().toISOString()}] Job details: ${title} in ${location}`);

      // Use Prisma transaction for atomic operation
      const newJob = await prisma.$transaction(async (tx) => {
        return await tx.job.create({
          data: {
            title,
            description,
            categoryId: parseInt(categoryId),
            skills,
            location,
            postedDate: new Date(),
            hourlyRate: parseInt(hourlyRate),
            status: 'Open',
            createdUserId: req.user.id
          },
          include: {
            category: true,
            createdUser: {
              select: {
                id: true,
                email: true,
                fname: true,
                lname: true
              }
            }
          }
        });
      });

      console.log(`[${new Date().toISOString()}] Job created successfully - Job ID: ${newJob.id}`);

      res.status(201).json({
        message: "Job posted successfully",
        job: newJob
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Create job error:`, error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Get jobs by current user
   */
  async getMyJobs(req, res) {
    try {
      console.log(`[${new Date().toISOString()}] Fetching jobs for user: ${req.user.email} (ID: ${req.user.id})`);

      const jobs = await jobService.getJobsByUserId(req.user.id);

      console.log(`[${new Date().toISOString()}] Found ${jobs.length} jobs for user ${req.user.email}`);

      res.json({
        message: "Jobs fetched successfully",
        jobs
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get my jobs error:`, error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Update job status
   */
  async updateJobStatus(req, res) {
    try {
      const { jobId } = req.params;
      const { status } = req.body;

      // Validation
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      console.log(`[${new Date().toISOString()}] Updating job status - Job ID: ${jobId}, New status: ${status}`);

      // Use transaction for atomic update
      const updatedJob = await prisma.$transaction(async (tx) => {
        // Check if job exists
        const job = await tx.job.findUnique({
          where: { id: parseInt(jobId) }
        });

        if (!job) {
          throw new Error('Job not found');
        }

        // Update job status
        return await tx.job.update({
          where: { id: parseInt(jobId) },
          data: { status: status }
        });
      });

      console.log(`[${new Date().toISOString()}] Job status updated successfully - Job ID: ${jobId}`);

      res.json({
        message: "Job status updated successfully",
        job: updatedJob
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Update job status error:`, error);

      if (error.message === 'Job not found') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Delete a job
   */
  async deleteJob(req, res) {
    try {
      const { jobId } = req.params;

      console.log(`[${new Date().toISOString()}] Deleting job - Job ID: ${jobId}, User: ${req.user.email}`);

      // Use transaction for atomic delete
      await prisma.$transaction(async (tx) => {
        // Check if job exists and belongs to user
        const job = await tx.job.findUnique({
          where: { id: parseInt(jobId) }
        });

        if (!job) {
          throw new Error('Job not found');
        }

        if (job.createdUserId !== req.user.id) {
          throw new Error('Unauthorized to delete this job');
        }

        // Delete the job
        await tx.job.delete({
          where: { id: parseInt(jobId) }
        });
      });

      console.log(`[${new Date().toISOString()}] Job deleted successfully - Job ID: ${jobId}`);

      res.json({
        message: "Job deleted successfully"
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Delete job error:`, error);

      if (error.message === 'Job not found') {
        return res.status(404).json({ message: error.message });
      }

      if (error.message === 'Unauthorized to delete this job') {
        return res.status(403).json({ message: error.message });
      }

      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }
}

module.exports = new JobController();
