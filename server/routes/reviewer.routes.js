const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin.middleware');

// All routes require authentication and reviewer/admin role
router.use(authMiddleware);
router.use(isAdmin); // This middleware allows both ADMIN and REVIEWER

// Job management routes for reviewers
router.get('/jobs', adminController.getAllJobs);
router.get('/jobs/:jobId', adminController.getJobById);
router.put('/jobs/:jobId/approve', adminController.approveJob);
router.put('/jobs/:jobId/reject', adminController.rejectJob);

module.exports = router;
