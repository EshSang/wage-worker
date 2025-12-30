const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get reviewer dashboard statistics
 */
async function getReviewerDashboardStats() {
  try {
    const [
      pendingOrdersCount,
      activeOrdersCount,
      completedOrdersCount,
      pendingJobsCount,
      pendingReviewsCount,
    ] = await Promise.all([
      // Pending orders
      prisma.order.count({
        where: {
          status: 'PENDING'
        }
      }),
      // Active orders (ACCEPTED status)
      prisma.order.count({
        where: {
          status: 'ACCEPTED'
        }
      }),
      // Completed orders
      prisma.order.count({
        where: {
          status: 'COMPLETED'
        }
      }),
      // Pending jobs awaiting approval
      prisma.job.count({
        where: {
          approvalStatus: 'PENDING'
        }
      }),
      // Pending reviews awaiting approval
      prisma.review.count({
        where: {
          approvalStatus: 'PENDING'
        }
      }),
    ]);

    return {
      pendingOrders: pendingOrdersCount,
      activeOrders: activeOrdersCount,
      completedOrders: completedOrdersCount,
      pendingJobs: pendingJobsCount,
      pendingReviews: pendingReviewsCount,
    };
  } catch (error) {
    console.error('Error in getReviewerDashboardStats:', error);
    throw error;
  }
}

/**
 * Get all orders with filters for reviewer
 */
async function getAllOrdersForReviewer(filters = {}) {
  try {
    const { status, search, page = 1, limit = 20 } = filters;

    const where = {};

    // Filter by status
    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Search filter
    if (search) {
      where.OR = [
        { job: { title: { contains: search } } },
        { user: { fname: { contains: search } } },
        { user: { lname: { contains: search } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
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
            }
          },
          jobApplication: {
            include: {
              user: {
                select: {
                  id: true,
                  fname: true,
                  lname: true,
                  email: true,
                }
              }
            }
          }
        },
        orderBy: {
          acceptedDate: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error in getAllOrdersForReviewer:', error);
    throw error;
  }
}

/**
 * Get pending jobs awaiting approval
 */
async function getPendingJobs(filters = {}) {
  try {
    const { search, page = 1, limit = 20 } = filters;

    const where = {
      approvalStatus: 'PENDING'
    };

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { category: { contains: search } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          category: true,
          createdUser: {
            select: {
              id: true,
              fname: true,
              lname: true,
              email: true,
            }
          },
          targetWorker: {
            select: {
              id: true,
              fname: true,
              lname: true,
              email: true,
            }
          },
          _count: {
            select: {
              jobApplications: true
            }
          }
        },
        orderBy: {
          postedDate: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      jobs,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error in getPendingJobs:', error);
    throw error;
  }
}

/**
 * Get all jobs (pending, approved, rejected) for reviewer
 */
async function getAllJobsForReviewer(filters = {}) {
  try {
    const { approvalStatus, search, page = 1, limit = 20 } = filters;

    const where = {};

    // Filter by approval status
    if (approvalStatus && approvalStatus !== 'ALL') {
      where.approvalStatus = approvalStatus;
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { category: { contains: search } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          category: true,
          createdUser: {
            select: {
              id: true,
              fname: true,
              lname: true,
              email: true,
            }
          },
          targetWorker: {
            select: {
              id: true,
              fname: true,
              lname: true,
              email: true,
            }
          },
          reviewer: {
            select: {
              id: true,
              fname: true,
              lname: true,
            }
          },
          _count: {
            select: {
              jobApplications: true
            }
          }
        },
        orderBy: {
          postedDate: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      jobs,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error in getAllJobsForReviewer:', error);
    throw error;
  }
}

/**
 * Approve a job
 */
async function approveJob(jobId, reviewerId) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        createdUser: true,
      }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.approvalStatus !== 'PENDING') {
      throw new Error('Job is not pending approval');
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        approvalStatus: 'APPROVED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        status: 'Open', // Set job status to Open when approved
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
        },
        reviewer: {
          select: {
            id: true,
            fname: true,
            lname: true,
          }
        }
      }
    });

    return updatedJob;
  } catch (error) {
    console.error('Error in approveJob:', error);
    throw error;
  }
}

/**
 * Reject a job
 */
async function rejectJob(jobId, reviewerId, reason) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        createdUser: true,
      }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.approvalStatus !== 'PENDING') {
      throw new Error('Job is not pending approval');
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        approvalStatus: 'REJECTED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        status: 'Closed', // Close job when rejected
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
        },
        reviewer: {
          select: {
            id: true,
            fname: true,
            lname: true,
          }
        }
      }
    });

    return updatedJob;
  } catch (error) {
    console.error('Error in rejectJob:', error);
    throw error;
  }
}

/**
 * Get pending reviews awaiting approval
 */
async function getPendingReviews(filters = {}) {
  try {
    const { search, page = 1, limit = 20 } = filters;

    const where = {
      approvalStatus: 'PENDING'
    };

    // Search filter
    if (search) {
      where.OR = [
        { comment: { contains: search } },
        { reviewer: { fname: { contains: search } } },
        { reviewer: { lname: { contains: search } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          order: {
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
                }
              }
            }
          },
          reviewer: {
            select: {
              id: true,
              fname: true,
              lname: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error in getPendingReviews:', error);
    throw error;
  }
}

/**
 * Get all reviews (pending, approved, rejected) for reviewer
 */
async function getAllReviewsForReviewer(filters = {}) {
  try {
    const { approvalStatus, search, page = 1, limit = 20 } = filters;

    const where = {};

    // Filter by approval status
    if (approvalStatus && approvalStatus !== 'ALL') {
      where.approvalStatus = approvalStatus;
    }

    // Search filter
    if (search) {
      where.OR = [
        { comment: { contains: search } },
        { reviewer: { fname: { contains: search } } },
        { reviewer: { lname: { contains: search } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          order: {
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
                }
              }
            }
          },
          reviewer: {
            select: {
              id: true,
              fname: true,
              lname: true,
              email: true,
            }
          },
          approver: {
            select: {
              id: true,
              fname: true,
              lname: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error in getAllReviewsForReviewer:', error);
    throw error;
  }
}

/**
 * Approve a review
 */
async function approveReview(reviewId, reviewerId) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        reviewer: true,
        order: {
          include: {
            job: {
              include: {
                createdUser: true,
              }
            }
          }
        }
      }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.approvalStatus !== 'PENDING') {
      throw new Error('Review is not pending approval');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        approvalStatus: 'APPROVED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        order: {
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
              }
            }
          }
        },
        reviewer: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          }
        },
        approver: {
          select: {
            id: true,
            fname: true,
            lname: true,
          }
        }
      }
    });

    return updatedReview;
  } catch (error) {
    console.error('Error in approveReview:', error);
    throw error;
  }
}

/**
 * Reject a review
 */
async function rejectReview(reviewId, reviewerId, reason) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        reviewer: true,
        order: {
          include: {
            job: {
              include: {
                createdUser: true,
              }
            }
          }
        }
      }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.approvalStatus !== 'PENDING') {
      throw new Error('Review is not pending approval');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        approvalStatus: 'REJECTED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        order: {
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
              }
            }
          }
        },
        reviewer: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          }
        },
        approver: {
          select: {
            id: true,
            fname: true,
            lname: true,
          }
        }
      }
    });

    return updatedReview;
  } catch (error) {
    console.error('Error in rejectReview:', error);
    throw error;
  }
}

/**
 * Get yearly report data for reviewer
 */
async function getYearlyReportData(year) {
  try {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Get monthly job approval data
    const monthlyData = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

      const [approvedJobsCount, rejectedJobsCount, approvedReviewsCount, rejectedReviewsCount] = await Promise.all([
        prisma.job.count({
          where: {
            approvalStatus: 'APPROVED',
            reviewedAt: {
              gte: monthStart,
              lte: monthEnd,
            }
          }
        }),
        prisma.job.count({
          where: {
            approvalStatus: 'REJECTED',
            reviewedAt: {
              gte: monthStart,
              lte: monthEnd,
            }
          }
        }),
        prisma.review.count({
          where: {
            approvalStatus: 'APPROVED',
            reviewedAt: {
              gte: monthStart,
              lte: monthEnd,
            }
          }
        }),
        prisma.review.count({
          where: {
            approvalStatus: 'REJECTED',
            reviewedAt: {
              gte: monthStart,
              lte: monthEnd,
            }
          }
        }),
      ]);

      monthlyData.push({
        month: monthNames[month],
        approvedJobs: approvedJobsCount,
        rejectedJobs: rejectedJobsCount,
        approvedReviews: approvedReviewsCount,
        rejectedReviews: rejectedReviewsCount,
        totalJobs: approvedJobsCount + rejectedJobsCount,
        totalReviews: approvedReviewsCount + rejectedReviewsCount,
      });
    }

    return {
      year,
      monthlyData,
    };
  } catch (error) {
    console.error('Error in getYearlyReportData:', error);
    throw error;
  }
}

/**
 * Get monthly report data for reviewer
 */
async function getMonthlyReportData(month, year) {
  try {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);

    const [
      approvedJobs,
      rejectedJobs,
      approvedReviews,
      rejectedReviews,
    ] = await Promise.all([
      prisma.job.findMany({
        where: {
          approvalStatus: 'APPROVED',
          reviewedAt: {
            gte: monthStart,
            lte: monthEnd,
          }
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
          },
          reviewer: {
            select: {
              id: true,
              fname: true,
              lname: true,
            }
          }
        },
        orderBy: {
          reviewedAt: 'desc'
        }
      }),
      prisma.job.findMany({
        where: {
          approvalStatus: 'REJECTED',
          reviewedAt: {
            gte: monthStart,
            lte: monthEnd,
          }
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
          },
          reviewer: {
            select: {
              id: true,
              fname: true,
              lname: true,
            }
          }
        },
        orderBy: {
          reviewedAt: 'desc'
        }
      }),
      prisma.review.findMany({
        where: {
          approvalStatus: 'APPROVED',
          reviewedAt: {
            gte: monthStart,
            lte: monthEnd,
          }
        },
        include: {
          order: {
            include: {
              job: true,
            }
          },
          reviewer: {
            select: {
              id: true,
              fname: true,
              lname: true,
              email: true,
            }
          },
          approver: {
            select: {
              id: true,
              fname: true,
              lname: true,
            }
          }
        },
        orderBy: {
          reviewedAt: 'desc'
        }
      }),
      prisma.review.findMany({
        where: {
          approvalStatus: 'REJECTED',
          reviewedAt: {
            gte: monthStart,
            lte: monthEnd,
          }
        },
        include: {
          order: {
            include: {
              job: true,
            }
          },
          reviewer: {
            select: {
              id: true,
              fname: true,
              lname: true,
              email: true,
            }
          },
          approver: {
            select: {
              id: true,
              fname: true,
              lname: true,
            }
          }
        },
        orderBy: {
          reviewedAt: 'desc'
        }
      }),
    ]);

    return {
      month,
      year,
      approvedJobs,
      rejectedJobs,
      approvedReviews,
      rejectedReviews,
      summary: {
        totalApprovedJobs: approvedJobs.length,
        totalRejectedJobs: rejectedJobs.length,
        totalApprovedReviews: approvedReviews.length,
        totalRejectedReviews: rejectedReviews.length,
      }
    };
  } catch (error) {
    console.error('Error in getMonthlyReportData:', error);
    throw error;
  }
}

module.exports = {
  getReviewerDashboardStats,
  getAllOrdersForReviewer,
  getPendingJobs,
  getAllJobsForReviewer,
  approveJob,
  rejectJob,
  getPendingReviews,
  getAllReviewsForReviewer,
  approveReview,
  rejectReview,
  getYearlyReportData,
  getMonthlyReportData,
};
