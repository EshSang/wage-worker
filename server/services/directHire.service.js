const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a direct hire job request
 * This creates a job and automatically creates a job application
 * for the target worker with status PENDING
 * Payment is verified before creating the request
 */
async function createDirectHireRequest(customerId, workerId, jobData, paymentIntentId) {
  try {
    // Validate payment intent is provided
    if (!paymentIntentId) {
      throw new Error('Payment Intent ID is required');
    }

    // Verify payment before creating request
    const paymentService = require('./payment.service');
    const paymentVerification = await paymentService.verifyPayment(paymentIntentId);

    if (!paymentVerification.verified) {
      throw new Error('Payment verification failed');
    }

    // Validate worker exists and is a USER type
    const worker = await prisma.user.findUnique({
      where: { id: workerId }
    });

    if (!worker || worker.usertype !== 'USER') {
      throw new Error('Invalid worker');
    }

    // Create job with jobType = DIRECT_HIRE
    const job = await prisma.job.create({
      data: {
        title: jobData.title,
        description: jobData.description,
        skills: jobData.skills || worker.skills || '',
        location: jobData.location,
        postedDate: new Date(),
        hourlyRate: parseInt(jobData.hourlyRate),
        status: 'Open',
        createdUserId: customerId,
        categoryId: parseInt(jobData.categoryId),
        jobType: 'DIRECT_HIRE',
        targetWorkerId: workerId,
      },
      include: {
        category: true,
        createdUser: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          }
        }
      }
    });

    // Auto-create job application with status PENDING and store payment info
    const application = await prisma.jobApplication.create({
      data: {
        jobId: job.id,
        userId: workerId,
        appliedDate: new Date(),
        applicationStatus: 'PENDING', // Worker must accept
        applicationType: 'DIRECT_HIRE',
        paymentIntentId: paymentIntentId, // Store payment intent for later use
      },
      include: {
        job: {
          include: {
            category: true,
            createdUser: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          }
        }
      }
    });

    console.log(`Direct hire request created with payment intent: ${paymentIntentId}`);

    return { job, application, paymentVerification };
  } catch (error) {
    console.error('Error in createDirectHireRequest:', error);
    throw error;
  }
}

/**
 * Worker accepts direct hire request
 * This will also create an order automatically so work can begin
 */
async function acceptDirectHireRequest(workerId, applicationId) {
  try {
    // Validate application belongs to worker
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            createdUser: true,
            category: true,
          }
        }
      }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.userId !== workerId) {
      throw new Error('Unauthorized - Application does not belong to this worker');
    }

    if (application.applicationType !== 'DIRECT_HIRE') {
      throw new Error('Not a direct hire request');
    }

    if (application.applicationStatus !== 'PENDING') {
      throw new Error('Application is not in PENDING status');
    }

    // Update application status to ACCEPTED
    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { applicationStatus: 'ACCEPTED' },
      include: {
        job: {
          include: {
            createdUser: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
              }
            },
            category: true,
          }
        },
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          }
        }
      }
    });

    // Automatically create an order when direct hire is accepted
    // This allows the worker to start work immediately
    const order = await prisma.order.create({
      data: {
        jobApplicationId: applicationId,
        jobId: application.jobId,
        userId: workerId, // The worker ID
        acceptedDate: new Date(),
        status: 'ACCEPTED', // Set to ACCEPTED so worker can start work
        // Include payment details if payment was made (for direct hire requests)
        ...(application.paymentIntentId && {
          paymentIntentId: application.paymentIntentId,
          paymentStatus: 'COMPLETED',
          paidAmount: application.job.hourlyRate,
          paymentDate: new Date(),
        }),
      },
      include: {
        job: {
          include: {
            category: true,
            createdUser: true,
          }
        },
        user: true,
        jobApplication: true,
      }
    });

    console.log('Order created automatically for direct hire:', order.id);

    return { application: updated, order };
  } catch (error) {
    console.error('Error in acceptDirectHireRequest:', error);
    throw error;
  }
}

/**
 * Worker rejects direct hire request
 */
async function rejectDirectHireRequest(workerId, applicationId, reason) {
  try {
    // Validate application belongs to worker
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            createdUser: true,
            category: true,
          }
        }
      }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.userId !== workerId) {
      throw new Error('Unauthorized - Application does not belong to this worker');
    }

    if (application.applicationType !== 'DIRECT_HIRE') {
      throw new Error('Not a direct hire request');
    }

    // Update status to REJECTED
    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        applicationStatus: 'REJECTED',
      },
      include: {
        job: {
          include: {
            createdUser: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
              }
            },
            category: true,
          }
        },
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          }
        }
      }
    });

    return updated;
  } catch (error) {
    console.error('Error in rejectDirectHireRequest:', error);
    throw error;
  }
}

/**
 * Get all direct hire requests for a worker
 */
async function getWorkerDirectHireRequests(workerId, status = 'PENDING') {
  try {
    const requests = await prisma.jobApplication.findMany({
      where: {
        userId: workerId,
        applicationType: 'DIRECT_HIRE',
        applicationStatus: status,
      },
      include: {
        job: {
          include: {
            createdUser: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
                phonenumber: true,
              }
            },
            category: true,
          }
        }
      },
      orderBy: {
        appliedDate: 'desc'
      }
    });

    return requests;
  } catch (error) {
    console.error('Error in getWorkerDirectHireRequests:', error);
    throw error;
  }
}

/**
 * Get customer's direct hire requests (both pending and accepted)
 */
async function getCustomerHiredWorkers(customerId) {
  try {
    const hiredWorkers = await prisma.jobApplication.findMany({
      where: {
        applicationType: 'DIRECT_HIRE',
        applicationStatus: {
          in: ['PENDING', 'ACCEPTED']
        },
        job: {
          createdUserId: customerId
        }
      },
      include: {
        job: {
          include: {
            category: true,
          }
        },
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
            phonenumber: true,
            address: true,
            skills: true,
          }
        },
        orders: {
          include: {
            reviews: true,
            earning: true,
          },
          orderBy: {
            acceptedDate: 'desc'
          }
        }
      },
      orderBy: {
        appliedDate: 'desc'
      }
    });

    return hiredWorkers;
  } catch (error) {
    console.error('Error in getCustomerHiredWorkers:', error);
    throw error;
  }
}

module.exports = {
  createDirectHireRequest,
  acceptDirectHireRequest,
  rejectDirectHireRequest,
  getWorkerDirectHireRequests,
  getCustomerHiredWorkers,
};
