const orderService = require('../services/order.service');

class OrderController {
  /**
   * Create order from accepted application
   * POST /api/orders
   */
  async createOrder(req, res) {
    try {
      const { applicationId } = req.body;
      const userId = req.user.id;

      if (!applicationId) {
        return res.status(400).json({ message: 'Application ID is required' });
      }

      const order = await orderService.createOrderFromApplication(applicationId, userId);

      res.status(201).json({
        message: 'Order created successfully',
        order,
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        message: error.message || 'Failed to create order',
      });
    }
  }

  /**
   * Get orders for logged-in worker
   * GET /api/orders/worker
   */
  async getWorkerOrders(req, res) {
    try {
      const userId = req.user.id;

      const orders = await orderService.getOrdersByWorkerId(userId);

      res.status(200).json({
        message: 'Orders retrieved successfully',
        orders,
        count: orders.length,
      });
    } catch (error) {
      console.error('Get worker orders error:', error);
      res.status(500).json({
        message: error.message || 'Failed to retrieve orders',
      });
    }
  }

  /**
   * Get orders for logged-in customer
   * GET /api/orders/customer
   */
  async getCustomerOrders(req, res) {
    try {
      const userId = req.user.id;

      const orders = await orderService.getOrdersByCustomerId(userId);

      res.status(200).json({
        message: 'Orders retrieved successfully',
        orders,
        count: orders.length,
      });
    } catch (error) {
      console.error('Get customer orders error:', error);
      res.status(500).json({
        message: error.message || 'Failed to retrieve orders',
      });
    }
  }

  /**
   * Accept order (customer only)
   * PATCH /api/orders/:orderId/accept
   */
  async acceptOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required' });
      }

      const order = await orderService.acceptOrder(parseInt(orderId), userId);

      res.status(200).json({
        message: 'Order accepted successfully',
        order,
      });
    } catch (error) {
      console.error('Accept order error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }

      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ message: error.message });
      }

      if (error.message.includes('Only') || error.message.includes('must')) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({
        message: error.message || 'Failed to accept order',
      });
    }
  }

  /**
   * Start order (worker only)
   * PATCH /api/orders/:orderId/start
   */
  async startOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required' });
      }

      const order = await orderService.startOrder(parseInt(orderId), userId);

      res.status(200).json({
        message: 'Order started successfully',
        order,
      });
    } catch (error) {
      console.error('Start order error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }

      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ message: error.message });
      }

      if (error.message.includes('already') || error.message.includes('Cannot')) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({
        message: error.message || 'Failed to start order',
      });
    }
  }

  /**
   * Complete order (worker only)
   * PATCH /api/orders/:orderId/complete
   */
  async completeOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required' });
      }

      const order = await orderService.completeOrder(parseInt(orderId), userId);

      res.status(200).json({
        message: 'Order completed successfully',
        order,
      });
    } catch (error) {
      console.error('Complete order error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }

      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ message: error.message });
      }

      if (error.message.includes('only complete')) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({
        message: error.message || 'Failed to complete order',
      });
    }
  }

  /**
   * Get single order by ID
   * GET /api/orders/:orderId
   */
  async getOrderById(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required' });
      }

      const order = await orderService.getOrderById(parseInt(orderId));

      // Verify user has access to this order (either worker or customer)
      const isWorker = order.userId === userId;
      const isCustomer = order.job.createdUserId === userId;

      if (!isWorker && !isCustomer) {
        return res.status(403).json({
          message: 'Unauthorized: You do not have permission to view this order'
        });
      }

      res.status(200).json({
        message: 'Order retrieved successfully',
        order,
      });
    } catch (error) {
      console.error('Get order by ID error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({
        message: error.message || 'Failed to retrieve order',
      });
    }
  }
}

module.exports = new OrderController();
