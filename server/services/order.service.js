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
}

module.exports = new OrderService();
