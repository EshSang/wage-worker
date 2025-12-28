const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all workers with optional filters
 */
async function getAllWorkers(filters = {}) {
  try {
    const { category, rating, location, availability } = filters;

    const where = {
      usertype: 'USER', // Only workers
    };

    if (location) {
      where.address = {
        contains: location,
      };
    }

    const workers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        phonenumber: true,
        address: true,
        skills: true,
        about: true,
      },
      orderBy: {
        id: 'desc',
      }
    });

    // Calculate stats for each worker
    const workersWithStats = await Promise.all(
      workers.map(async (worker) => {
        const stats = await getWorkerStats(worker.id);
        return {
          ...worker,
          location: worker.address,
          stats,
        };
      })
    );

    return workersWithStats;
  } catch (error) {
    console.error('Error in getAllWorkers:', error);
    throw error;
  }
}

/**
 * Get worker statistics
 */
async function getWorkerStats(workerId) {
  try {
    // Get completed jobs count
    const completedOrders = await prisma.order.count({
      where: {
        userId: workerId,
        status: 'COMPLETED',
      }
    });

    // Get average rating and total reviews
    const reviews = await prisma.review.findMany({
      where: {
        order: {
          userId: workerId,
        }
      },
      select: {
        rating: true,
      }
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    // Get total earnings
    const earnings = await prisma.earning.aggregate({
      where: {
        workerId: workerId,
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      }
    });

    const totalEarnings = earnings._sum.amount || 0;

    return {
      completedJobs: completedOrders,
      averageRating: parseFloat(averageRating),
      totalReviews,
      totalEarnings,
      successRate: completedOrders > 0 ? 100 : 0, // Can be improved with actual calculation
    };
  } catch (error) {
    console.error('Error in getWorkerStats:', error);
    return {
      completedJobs: 0,
      averageRating: 0,
      totalReviews: 0,
      totalEarnings: 0,
      successRate: 0,
    };
  }
}

/**
 * Get worker's recent completed jobs
 */
async function getWorkerRecentJobs(workerId, limit = 5) {
  try {
    const recentOrders = await prisma.order.findMany({
      where: {
        userId: workerId,
        status: 'COMPLETED',
      },
      include: {
        job: {
          include: {
            category: true,
          }
        },
        reviews: true,
      },
      orderBy: {
        completedDate: 'desc',
      },
      take: limit,
    });

    // Format the response
    const recentJobs = recentOrders.map(order => ({
      id: order.job.id,
      title: order.job.title,
      description: order.job.description,
      category: order.job.category,
      completedDate: order.completedDate,
      review: order.reviews.length > 0 ? {
        rating: order.reviews[0].rating,
        comment: order.reviews[0].comment,
      } : null,
    }));

    return recentJobs;
  } catch (error) {
    console.error('Error in getWorkerRecentJobs:', error);
    throw error;
  }
}

/**
 * Get worker detailed profile with recent jobs
 */
async function getWorkerDetailedProfile(workerId) {
  try {
    // Get basic worker info
    const worker = await prisma.user.findUnique({
      where: {
        id: workerId,
        usertype: 'USER',
      },
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        phonenumber: true,
        address: true,
        skills: true,
        about: true,
      }
    });

    if (!worker) {
      throw new Error('Worker not found');
    }

    // Get worker stats
    const stats = await getWorkerStats(workerId);

    // Get recent jobs
    const recentJobs = await getWorkerRecentJobs(workerId, 5);

    return {
      ...worker,
      location: worker.address,
      stats,
      recentJobs,
    };
  } catch (error) {
    console.error('Error in getWorkerDetailedProfile:', error);
    throw error;
  }
}

/**
 * Search workers by query
 */
async function searchWorkers(query) {
  try {
    const workers = await prisma.user.findMany({
      where: {
        usertype: 'USER',
        OR: [
          {
            fname: {
              contains: query,
            }
          },
          {
            lname: {
              contains: query,
            }
          },
          {
            skills: {
              contains: query,
            }
          },
          {
            address: {
              contains: query,
            }
          }
        ]
      },
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        phonenumber: true,
        address: true,
        skills: true,
        about: true,
      }
    });

    // Add stats to each worker
    const workersWithStats = await Promise.all(
      workers.map(async (worker) => {
        const stats = await getWorkerStats(worker.id);
        return {
          ...worker,
          location: worker.address,
          stats,
        };
      })
    );

    return workersWithStats;
  } catch (error) {
    console.error('Error in searchWorkers:', error);
    throw error;
  }
}

module.exports = {
  getAllWorkers,
  getWorkerStats,
  getWorkerRecentJobs,
  getWorkerDetailedProfile,
  searchWorkers,
};
