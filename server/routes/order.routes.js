const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/orders
 * @desc    Create order from accepted application
 * @access  Private (Customer)
 */
router.post('/', orderController.createOrder);

/**
 * @route   GET /api/orders/worker
 * @desc    Get all orders for logged-in worker
 * @access  Private (Worker)
 */
router.get('/worker', orderController.getWorkerOrders);

/**
 * @route   GET /api/orders/customer
 * @desc    Get all orders for logged-in customer
 * @access  Private (Customer)
 */
router.get('/customer', orderController.getCustomerOrders);

/**
 * @route   PATCH /api/orders/:orderId/accept
 * @desc    Accept order (change status from PENDING to ACCEPTED)
 * @access  Private (Customer)
 */
router.patch('/:orderId/accept', orderController.acceptOrder);

/**
 * @route   PATCH /api/orders/:orderId/start
 * @desc    Start order (sets startedDate)
 * @access  Private (Worker)
 */
router.patch('/:orderId/start', orderController.startOrder);

/**
 * @route   PATCH /api/orders/:orderId/complete
 * @desc    Complete order (change status to COMPLETED)
 * @access  Private (Worker)
 */
router.patch('/:orderId/complete', orderController.completeOrder);

/**
 * @route   GET /api/orders/:orderId
 * @desc    Get single order by ID
 * @access  Private (Worker or Customer)
 */
router.get('/:orderId', orderController.getOrderById);

module.exports = router;
