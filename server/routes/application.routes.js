const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/applications
 * @desc    Submit a new job application
 * @access  Private (Worker)
 */
router.post('/', applicationController.submitApplication);

/**
 * @route   GET /api/applications/my-applications
 * @desc    Get all applications submitted by current user
 * @access  Private (Worker)
 */
router.get('/my-applications', applicationController.getMyApplications);

/**
 * @route   GET /api/applications/my-jobs
 * @desc    Get all applications for jobs posted by current user
 * @access  Private (Customer)
 */
router.get('/my-jobs', applicationController.getApplicationsForMyJobs);

/**
 * @route   GET /api/applications/job/:jobId
 * @desc    Get all applications for a specific job
 * @access  Private (Customer/Job Poster)
 */
router.get('/job/:jobId', applicationController.getJobApplications);

/**
 * @route   PATCH /api/applications/:applicationId/status
 * @desc    Update application status
 * @access  Private (Customer/Job Poster)
 */
router.patch('/:applicationId/status', applicationController.updateApplicationStatus);

/**
 * @route   DELETE /api/applications/:applicationId
 * @desc    Delete/withdraw an application
 * @access  Private (Worker/Application Owner)
 */
router.delete('/:applicationId', applicationController.deleteApplication);

module.exports = router;
