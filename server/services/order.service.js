const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OrderService {
  /**
   * Create an order from an accepted application
   * @param {number} applicationId - The job application ID
   * @param {number} userId - The user ID (should be customer)
   * @returns {Promise<Object>} The created order
   */
  async createOrderFromApplication(applicationId, userId) {
    // First, get the application details
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        user: true,
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Verify the user is the job owner (customer)
    if (application.job.createdUserId !== userId) {
      throw new Error('Unauthorized: You can only create orders for your own jobs');
    }

    // Verify the application is approved
    if (application.applicationStatus !== 'APPROVED') {
      throw new Error('Can only create order from approved application');
    }

    // Check if order already exists for this application
    const existingOrder = await prisma.order.findFirst({
      where: { jobApplicationId: applicationId },
    });

    if (existingOrder) {
      return existingOrder;
    }

    // Create the order with ACCEPTED status so worker can start immediately
    const order = await prisma.order.create({
      data: {
        jobApplicationId: applicationId,
        jobId: application.jobId,
        userId: application.userId, // The worker ID
        acceptedDate: new Date(),
        status: 'ACCEPTED', // Set to ACCEPTED so worker can start work immediately
      },
      include: {
        job: true,
        user: true,
        jobApplication: true,
      },
    });

    return order;
  }

  /**
   * Get order by ID
   * @param {number} orderId - The order ID
   * @returns {Promise<Object>} The order
   */
  async getOrderById(orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
              },
            },
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
            phonenumber: true,
            skills: true,
            about: true,
          },
        },
        jobApplication: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  /**
   * Get all orders for a worker
   * @param {number} userId - The worker user ID
   * @returns {Promise<Array>} List of orders
   */
  async getOrdersByWorkerId(userId) {
    const orders = await prisma.order.findMany({
      where: { userId },
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
              },
            },
            category: true,
          },
        },
        jobApplication: true,
      },
      orderBy: {
        acceptedDate: 'desc',
      },
    });

    return orders;
  }

  /**
   * Get all orders for a customer (job owner)
   * @param {number} customerId - The customer user ID
   * @returns {Promise<Array>} List of orders
   */
  async getOrdersByCustomerId(customerId) {
    const orders = await prisma.order.findMany({
      where: {
        job: {
          createdUserId: customerId,
        },
      },
      include: {
        job: {
          include: {
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
            phonenumber: true,
            skills: true,
            about: true,
          },
        },
        jobApplication: true,
        reviews: true, // Include reviews if exist
      },
      orderBy: {
        acceptedDate: 'desc',
      },
    });

    return orders;
  }

  /**
   * Accept an order (customer action)
   * Changes order status from PENDING to ACCEPTED
   * @param {number} orderId - The order ID
   * @param {number} userId - The customer user ID
   * @returns {Promise<Object>} The updated order
   */
  async acceptOrder(orderId, userId) {
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        job: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Verify the user is the job owner (customer)
    if (order.job.createdUserId !== userId) {
      throw new Error('Unauthorized: Only the job owner can accept orders');
    }

    // Verify the order is pending
    if (order.status !== 'PENDING') {
      throw new Error('Only pending orders can be accepted');
    }

    // Update the order to ACCEPTED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'ACCEPTED',
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
              },
            },
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          },
        },
        jobApplication: true,
      },
    });

    return updatedOrder;
  }

  /**
   * Start an order (worker action)
   * Sets startedDate to indicate work has begun
   * @param {number} orderId - The order ID
   * @param {number} userId - The worker user ID
   * @returns {Promise<Object>} The updated order
   */
  async startOrder(orderId, userId) {
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        job: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Verify the user is the worker assigned to this order
    if (order.userId !== userId) {
      throw new Error('Unauthorized: You can only start your own orders');
    }

    // Verify the order status allows starting
    if (order.startedDate) {
      throw new Error('Order has already been started');
    }

    if (order.status === 'COMPLETED') {
      throw new Error('Order is already completed');
    }

    if (order.status === 'CANCELLED') {
      throw new Error('Cannot start a cancelled order');
    }

    if (order.status === 'PENDING') {
      throw new Error('Order must be accepted by customer first');
    }

    // Update the order - just set startedDate, keep status as ACCEPTED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        startedDate: new Date(),
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
              },
            },
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          },
        },
        jobApplication: true,
      },
    });

    return updatedOrder;
  }

  /**
   * Complete an order (worker action)
   * @param {number} orderId - The order ID
   * @param {number} userId - The worker user ID
   * @returns {Promise<Object>} The updated order
   */
  async completeOrder(orderId, userId) {
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Verify the user is the worker assigned to this order
    if (order.userId !== userId) {
      throw new Error('Unauthorized: You can only complete your own orders');
    }

    // Verify the order has been started and is accepted
    if (order.status !== 'ACCEPTED') {
      throw new Error('Can only complete orders that are accepted');
    }

    if (!order.startedDate) {
      throw new Error('Order must be started before it can be completed');
    }

    // Update the order to COMPLETED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
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
              },
            },
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          },
        },
        jobApplication: true,
      },
    });

    // Automatically create earning record
    try {
      const earningService = require('./earning.service');
      await earningService.createEarningFromOrder(orderId);
      console.log(`Earning record created for order ${orderId}`);
    } catch (earningError) {
      console.error(`Failed to create earning record for order ${orderId}:`, earningError);
      // Don't fail the order completion if earning creation fails
    }

    return updatedOrder;
  }

  /**
   * Update order status
   * @param {number} orderId - The order ID
   * @param {string} status - The new status
   * @param {number} userId - The user ID
   * @returns {Promise<Object>} The updated order
   */
  async updateOrderStatus(orderId, status, userId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        job: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Verify authorization based on status change
    const isWorker = order.userId === userId;
    const isCustomer = order.job.createdUserId === userId;

    if (!isWorker && !isCustomer) {
      throw new Error('Unauthorized: You do not have permission to update this order');
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        job: {
          include: {
            createdUser: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
              },
            },
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
          },
        },
        jobApplication: true,
      },
    });

    return updatedOrder;
  }

  /**
   * Get worker earnings summary and detailed earnings list
   * @param {number} workerId - The worker user ID
   * @param {Object} filters - Optional filters (startDate, endDate, status)
   * @returns {Promise<Object>} Earnings summary and list
   */
  async getWorkerEarnings(workerId, filters = {}) {
    const { startDate, endDate, status } = filters;

    // Build where clause
    const where = {
      userId: workerId,
      status: status || 'COMPLETED', // Default to COMPLETED orders
    };

    // Add date filters if provided
    if (startDate || endDate) {
      where.completedDate = {};
      if (startDate) {
        where.completedDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.completedDate.lte = new Date(endDate);
      }
    }

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        job: {
          include: {
            createdUser: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
              },
            },
            category: true,
          },
        },
        reviews: true,
      },
      orderBy: {
        completedDate: 'desc',
      },
    });

    // Calculate earnings for each order
    const earnings = orders.map((order) => {
      const hourlyRate = order.job.hourlyRate || 0;

      // Calculate hours worked (days * 8 hours, or estimate)
      let hoursWorked = 8; // Default 8 hours per day
      if (order.startedDate && order.completedDate) {
        const start = new Date(order.startedDate);
        const end = new Date(order.completedDate);
        const daysWorked = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        hoursWorked = daysWorked > 0 ? daysWorked * 8 : 8;
      }

      const estimatedEarning = hourlyRate * hoursWorked;

      return {
        orderId: order.id,
        jobTitle: order.job.title,
        jobCategory: order.job.category?.category || 'N/A',
        customerName: `${order.job.createdUser?.fname} ${order.job.createdUser?.lname}`,
        hourlyRate,
        hoursWorked,
        estimatedEarning,
        completedDate: order.completedDate,
        acceptedDate: order.acceptedDate,
        startedDate: order.startedDate,
        status: order.status,
        rating: order.reviews && order.reviews.length > 0 ? order.reviews[0].rating : null,
      };
    });

    // Calculate summary
    const totalEarnings = earnings.reduce((sum, e) => sum + e.estimatedEarning, 0);
    const completedOrders = earnings.length;
    const averagePerOrder = completedOrders > 0 ? totalEarnings / completedOrders : 0;

    // Calculate this month earnings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEarnings = earnings
      .filter((e) => e.completedDate && new Date(e.completedDate) >= startOfMonth)
      .reduce((sum, e) => sum + e.estimatedEarning, 0);

    // Calculate this week earnings
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const thisWeekEarnings = earnings
      .filter((e) => e.completedDate && new Date(e.completedDate) >= startOfWeek)
      .reduce((sum, e) => sum + e.estimatedEarning, 0);

    // Calculate average rating
    const ratingsArray = earnings.filter((e) => e.rating !== null).map((e) => e.rating);
    const averageRating = ratingsArray.length > 0
      ? ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length
      : 0;

    return {
      summary: {
        totalEarnings: Math.round(totalEarnings),
        completedOrders,
        averagePerOrder: Math.round(averagePerOrder),
        thisMonth: Math.round(thisMonthEarnings),
        thisWeek: Math.round(thisWeekEarnings),
        averageRating: parseFloat(averageRating.toFixed(1)),
      },
      earnings,
    };
  }

  /**
   * Get worker earnings grouped by month
   * @param {number} workerId - The worker user ID
   * @param {number} year - The year (optional, defaults to current year)
   * @returns {Promise<Array>} Monthly earnings breakdown
   */
  async getWorkerEarningsByMonth(workerId, year) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const orders = await prisma.order.findMany({
      where: {
        userId: workerId,
        status: 'COMPLETED',
        completedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        job: true,
      },
      orderBy: {
        completedDate: 'asc',
      },
    });

    // Group by month
    const monthlyData = {};
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Initialize all months
    for (let i = 0; i < 12; i++) {
      monthlyData[i] = {
        month: `${monthNames[i]} ${targetYear}`,
        monthNumber: i + 1,
        earnings: 0,
        orders: 0,
      };
    }

    // Aggregate orders by month
    orders.forEach((order) => {
      const completedDate = new Date(order.completedDate);
      const month = completedDate.getMonth();

      const hourlyRate = order.job.hourlyRate || 0;
      let hoursWorked = 8;
      if (order.startedDate && order.completedDate) {
        const start = new Date(order.startedDate);
        const end = new Date(order.completedDate);
        const daysWorked = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        hoursWorked = daysWorked > 0 ? daysWorked * 8 : 8;
      }

      const estimatedEarning = hourlyRate * hoursWorked;

      monthlyData[month].earnings += estimatedEarning;
      monthlyData[month].orders += 1;
    });

    // Convert to array and round earnings
    const result = Object.values(monthlyData).map((data) => ({
      ...data,
      earnings: Math.round(data.earnings),
    }));

    return result;
  }

  /**
   * Get worker earnings grouped by job category
   * @param {number} workerId - The worker user ID
   * @returns {Promise<Array>} Earnings by category
   */
  async getWorkerEarningsByCategory(workerId) {
    const orders = await prisma.order.findMany({
      where: {
        userId: workerId,
        status: 'COMPLETED',
      },
      include: {
        job: {
          include: {
            category: true,
          },
        },
      },
    });

    // Group by category
    const categoryData = {};

    orders.forEach((order) => {
      const categoryName = order.job.category?.category || 'Other';

      if (!categoryData[categoryName]) {
        categoryData[categoryName] = {
          category: categoryName,
          earnings: 0,
          orders: 0,
        };
      }

      const hourlyRate = order.job.hourlyRate || 0;
      let hoursWorked = 8;
      if (order.startedDate && order.completedDate) {
        const start = new Date(order.startedDate);
        const end = new Date(order.completedDate);
        const daysWorked = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        hoursWorked = daysWorked > 0 ? daysWorked * 8 : 8;
      }

      const estimatedEarning = hourlyRate * hoursWorked;

      categoryData[categoryName].earnings += estimatedEarning;
      categoryData[categoryName].orders += 1;
    });

    // Convert to array and round earnings
    const result = Object.values(categoryData).map((data) => ({
      ...data,
      earnings: Math.round(data.earnings),
    })).sort((a, b) => b.earnings - a.earnings); // Sort by earnings descending

    return result;
  }
}

module.exports = new OrderService();
