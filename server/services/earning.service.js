const prisma = require('../config/prisma');

class EarningService {
  /**
   * Automatically create earning record when order is completed
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Created earning record
   */
  async createEarningFromOrder(orderId) {
    // Get order with job and application details
    const orderDetails = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        job: true,
        jobApplication: true,
      },
    });

    if (!orderDetails) {
      throw new Error('Order not found');
    }

    // Check if earning already exists for this order
    const existingEarning = await prisma.earning.findUnique({
      where: { orderId: orderId },
    });

    if (existingEarning) {
      console.log(`Earning already exists for order ${orderId}`);
      return existingEarning;
    }

    const earning = await prisma.earning.create({
      data: {
        jobApplicationId: orderDetails.jobApplicationId,
        jobId: orderDetails.jobId,
        workerId: orderDetails.userId,
        customerId: orderDetails.job.createdUserId,
        amount: orderDetails.job.hourlyRate, // Hourly rate is full amount
        earnedDate: new Date(),
        orderId: orderId,
        status: 'COMPLETED',
        // paymentGatewayId will be null until payment gateway is implemented
      },
    });

    return earning;
  }

  /**
   * Get all earnings for a worker with filters
   * @param {number} workerId - Worker user ID
   * @param {Object} filters - Optional filters (startDate, endDate, status)
   * @returns {Promise<Array>} Worker earnings
   */
  async getWorkerEarnings(workerId, filters = {}) {
    const { startDate, endDate, status } = filters;

    const where = {
      workerId,
    };

    if (startDate || endDate) {
      where.earnedDate = {};
      if (startDate) where.earnedDate.gte = new Date(startDate);
      if (endDate) where.earnedDate.lte = new Date(endDate);
    }

    if (status) where.status = status;

    const earnings = await prisma.earning.findMany({
      where,
      include: {
        job: {
          include: {
            category: true,
          },
        },
        customer: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          },
        },
        order: {
          include: {
            reviews: true,
          },
        },
      },
      orderBy: {
        earnedDate: 'desc',
      },
    });

    // Format earnings with additional computed fields
    const formattedEarnings = earnings.map((earning) => ({
      id: earning.id,
      orderId: earning.orderId,
      jobTitle: earning.job.title,
      jobCategory: earning.job.category?.category || 'N/A',
      customerName: `${earning.customer.fname} ${earning.customer.lname}`,
      amount: earning.amount,
      earnedDate: earning.earnedDate,
      status: earning.status,
      paymentGatewayId: earning.paymentGatewayId,
      rating: earning.order?.reviews && earning.order.reviews.length > 0
        ? earning.order.reviews[0].rating
        : null,
    }));

    return formattedEarnings;
  }

  /**
   * Get worker earnings summary
   * @param {number} workerId - Worker user ID
   * @returns {Promise<Object>} Summary statistics
   */
  async getWorkerEarningsSummary(workerId) {
    const earnings = await prisma.earning.findMany({
      where: { workerId, status: 'COMPLETED' },
      include: {
        order: {
          include: {
            reviews: true,
          },
        },
      },
    });

    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const completedCount = earnings.length;
    const averagePerJob = completedCount > 0 ? totalEarnings / completedCount : 0;

    // This month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = earnings
      .filter((e) => e.earnedDate >= startOfMonth)
      .reduce((sum, e) => sum + e.amount, 0);

    // This week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const thisWeek = earnings
      .filter((e) => e.earnedDate >= startOfWeek)
      .reduce((sum, e) => sum + e.amount, 0);

    // Calculate average rating
    const ratingsArray = earnings
      .filter((e) => e.order?.reviews && e.order.reviews.length > 0)
      .map((e) => e.order.reviews[0].rating);
    const averageRating =
      ratingsArray.length > 0
        ? ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length
        : 0;

    return {
      totalEarnings: Math.round(totalEarnings),
      completedJobs: completedCount,
      averagePerJob: Math.round(averagePerJob),
      thisMonth: Math.round(thisMonth),
      thisWeek: Math.round(thisWeek),
      averageRating: parseFloat(averageRating.toFixed(1)),
    };
  }

  /**
   * Get worker earnings grouped by month
   * @param {number} workerId - Worker user ID
   * @param {number} year - Target year (optional, defaults to current year)
   * @returns {Promise<Array>} Monthly earnings breakdown
   */
  async getWorkerEarningsByMonth(workerId, year) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const earnings = await prisma.earning.findMany({
      where: {
        workerId,
        status: 'COMPLETED',
        earnedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { earnedDate: 'asc' },
    });

    // Group by month
    const monthlyData = {};
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Initialize all months
    for (let i = 0; i < 12; i++) {
      monthlyData[i] = {
        month: `${monthNames[i]} ${targetYear}`,
        monthNumber: i + 1,
        earnings: 0,
        jobs: 0,
      };
    }

    // Aggregate
    earnings.forEach((earning) => {
      const month = new Date(earning.earnedDate).getMonth();
      monthlyData[month].earnings += earning.amount;
      monthlyData[month].jobs += 1;
    });

    return Object.values(monthlyData).map((data) => ({
      ...data,
      earnings: Math.round(data.earnings),
    }));
  }

  /**
   * Get worker earnings by job category
   * @param {number} workerId - Worker user ID
   * @returns {Promise<Array>} Earnings by category
   */
  async getWorkerEarningsByCategory(workerId) {
    const earnings = await prisma.earning.findMany({
      where: {
        workerId,
        status: 'COMPLETED',
      },
      include: {
        job: {
          include: { category: true },
        },
      },
    });

    const categoryData = {};

    earnings.forEach((earning) => {
      const categoryName = earning.job.category?.category || 'Other';

      if (!categoryData[categoryName]) {
        categoryData[categoryName] = {
          category: categoryName,
          earnings: 0,
          jobs: 0,
        };
      }

      categoryData[categoryName].earnings += earning.amount;
      categoryData[categoryName].jobs += 1;
    });

    return Object.values(categoryData)
      .map((data) => ({
        ...data,
        earnings: Math.round(data.earnings),
      }))
      .sort((a, b) => b.earnings - a.earnings);
  }

  /**
   * Get customer's total payments
   * @param {number} customerId - Customer user ID
   * @param {Object} filters - Optional filters (startDate, endDate)
   * @returns {Promise<Array>} Customer payments
   */
  async getCustomerPayments(customerId, filters = {}) {
    const { startDate, endDate } = filters;

    const where = { customerId };

    if (startDate || endDate) {
      where.earnedDate = {};
      if (startDate) where.earnedDate.gte = new Date(startDate);
      if (endDate) where.earnedDate.lte = new Date(endDate);
    }

    const payments = await prisma.earning.findMany({
      where,
      include: {
        job: true,
        worker: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          },
        },
        order: true,
      },
      orderBy: {
        earnedDate: 'desc',
      },
    });

    return payments;
  }
}

module.exports = new EarningService();
