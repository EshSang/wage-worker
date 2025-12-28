const express = require('express');
const router = express.Router();
const workerController = require('../controllers/worker.controller');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get all workers with filters
router.get('/', workerController.getAllWorkers);

// Search workers
router.get('/search', workerController.searchWorkers);

// Get worker profile
router.get('/:id/profile', workerController.getWorkerProfile);

// Get worker detailed profile with recent jobs
router.get('/:id/detailed-profile', workerController.getWorkerDetailedProfile);

// Get worker statistics
router.get('/:id/stats', workerController.getWorkerStats);

module.exports = router;
