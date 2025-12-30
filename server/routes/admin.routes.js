const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin.middleware');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(isAdmin);

// Dashboard routes
router.get('/dashboard/statistics', adminController.getDashboardStatistics);
router.get('/dashboard/recent-jobs', adminController.getRecentJobRequests);

// User management routes
router.get('/users/statistics', adminController.getUserStatistics);
router.get('/users/:userId', adminController.getUserById);
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// Job management routes
router.get('/jobs/statistics', adminController.getJobStatistics);
router.get('/jobs/:jobId', adminController.getJobById);
router.get('/jobs', adminController.getAllJobs);

// Earnings management routes
router.get('/earnings/statistics', adminController.getEarningsStatistics);
router.get('/earnings', adminController.getAllEarnings);

// Report routes
router.get('/reports/monthly', reportController.getMonthlyReport);
router.get('/reports/yearly', reportController.getYearlyReport);
router.get('/reports/download/pdf', reportController.downloadPDFReport);
router.get('/reports/download/excel', reportController.downloadExcelReport);

module.exports = router;
