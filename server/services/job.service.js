const prisma = require('../config/prisma');

class JobService {
  /**
   * Get all available jobs
   */
  async getAllJobs() {
    return await prisma.job.findMany({
      orderBy: {
        postedDate: 'desc'
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
  }

  /**
   * Get job by ID
   */
  async getJobById(jobId) {
    return await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        category: true,
        createdUser: {
          select: {
            id: true,
            email: true,
            fname: true,
            lname: true
          }
        },
        jobApplications: {
          include: {
            user: true
          }
        }
      }
    });
  }

  /**
   * Create a new job posting
   */
  async createJob(jobData) {
    return await prisma.job.create({
      data: jobData,
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
  }

  /**
   * Update job status
   */
  async updateJobStatus(jobId, status) {
    return await prisma.job.update({
      where: { id: jobId },
      data: { status: status }
    });
  }

  /**
   * Get jobs by user ID
   */
  async getJobsByUserId(userId) {
    return await prisma.job.findMany({
      where: { createdUserId: userId },
      orderBy: {
        postedDate: 'desc'
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
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId) {
    return await prisma.job.delete({
      where: { id: jobId }
    });
  }
}

module.exports = new JobService();
