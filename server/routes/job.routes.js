const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const verifyToken = require('../middleware/auth');

// All job routes require authentication
router.use(verifyToken);

// Get all jobs
router.get('/', jobController.getAllJobs);

// Get jobs posted by current user
router.get('/my-jobs', jobController.getMyJobs);

// Create a new job
router.post('/', jobController.createJob);

// Update job status
router.patch('/:jobId/status', jobController.updateJobStatus);

// Delete a job
router.delete('/:jobId', jobController.deleteJob);

module.exports = router;
