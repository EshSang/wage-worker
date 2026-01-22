const prisma = require('../config/prisma');

class ApplicationService {
  /**
   * Create a new job application
   */
  async createApplication(applicationData) {
    return await prisma.jobApplication.create({
      data: applicationData,
      include: {
        job: {
          include: {
            category: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            fname: true,
            lname: true,
            phonenumber: true
          }
        }
      }
    });
  }

  /**
   * Get all applications for a specific job
   */
  async getApplicationsByJobId(jobId) {
    return await prisma.jobApplication.findMany({
      where: { jobId: jobId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fname: true,
            lname: true,
            phonenumber: true,
            skills: true,
            about: true
          }
        },
        job: {
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
        }
      },
      orderBy: {
        appliedDate: 'desc'
      }
    });
  }

  /**
   * Get all applications by a specific user
   */
  async getApplicationsByUserId(userId) {
    return await prisma.jobApplication.findMany({
      where: { userId: userId },
      include: {
        job: {
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
        }
      },
      orderBy: {
        appliedDate: 'desc'
      }
    });
  }

  /**
   * Get all applications for jobs posted by a user (customer view)
   * Excludes DIRECT_HIRE applications since those appear in "Hired Workers" tab
   * Excludes applications that already have orders (those appear in "Accepted / In Progress" tab)
   */
  async getApplicationsForUserJobs(userId) {
    const applications = await prisma.jobApplication.findMany({
      where: {
        job: {
          createdUserId: userId
        },
        applicationType: 'MANUAL' // Only show worker-initiated applications, exclude DIRECT_HIRE
      },
      include: {
        job: {
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
        },
        user: {
          select: {
            id: true,
            email: true,
            fname: true,
            lname: true,
            phonenumber: true,
            skills: true,
            about: true
          }
        },
        orders: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        appliedDate: 'desc'
      }
    });

    // Filter out applications that already have orders (they appear in "Accepted / In Progress" tab)
    const applicationsWithoutOrders = applications.filter(app => !app.orders || app.orders.length === 0);

    // Add hasOrder flag to each application (will always be false now, but kept for consistency)
    return applicationsWithoutOrders.map(app => ({
      ...app,
      hasOrder: false
    }));
  }

  /**
   * Get application by ID
   */
  async getApplicationById(applicationId) {
    return await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            category: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            fname: true,
            lname: true,
            phonenumber: true,
            skills: true,
            about: true,
            address: true
          }
        }
      }
    });
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(applicationId, status) {
    return await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { applicationStatus: status },
      include: {
        job: true,
        user: {
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
   * Delete an application
   */
  async deleteApplication(applicationId) {
    return await prisma.jobApplication.delete({
      where: { id: applicationId }
    });
  }

  /**
   * Check if user has already applied to a job
   */
  async checkExistingApplication(userId, jobId) {
    return await prisma.jobApplication.findFirst({
      where: {
        userId: userId,
        jobId: jobId
      }
    });
  }

  /**
   * Reject all other applications for a specific job
   */
  async rejectOtherApplications(jobId, approvedApplicationId) {
    return await prisma.jobApplication.updateMany({
      where: {
        jobId: jobId,
        id: {
          not: approvedApplicationId
        },
        applicationStatus: {
          in: ['APPLIED', 'PENDING']
        }
      },
      data: {
        applicationStatus: 'REJECTED'
      }
    });
  }
}

module.exports = new ApplicationService();
