const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const jobRoutes = require('./job.routes');
const categoryRoutes = require('./category.routes');
const applicationRoutes = require('./application.routes');
const orderRoutes = require('./order.routes');
const reviewRoutes = require('./review.routes');
const earningRoutes = require('./earning.routes');
const analyticsRoutes = require('./analytics.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/categories', categoryRoutes);
router.use('/applications', applicationRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/earnings', earningRoutes);
router.use('/analytics', analyticsRoutes);

// Health check
router.get('/healthcheck', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
