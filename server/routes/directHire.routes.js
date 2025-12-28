const express = require('express');
const router = express.Router();
const directHireController = require('../controllers/directHire.controller');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Customer creates direct hire request
router.post('/request', directHireController.createDirectHireRequest);

// Worker accepts/rejects direct hire request
router.patch('/accept/:applicationId', directHireController.acceptDirectHireRequest);
router.patch('/reject/:applicationId', directHireController.rejectDirectHireRequest);

// Get worker's direct hire requests
router.get('/requests', directHireController.getWorkerRequests);

// Get customer's hired workers
router.get('/hired-workers', directHireController.getCustomerHiredWorkers);

module.exports = router;
