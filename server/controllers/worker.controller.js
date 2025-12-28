const workerService = require('../services/worker.service');

/**
 * Get all workers with optional filters
 * GET /api/workers?category=...&rating=...&location=...
 */
async function getAllWorkers(req, res) {
  try {
    const filters = {
      category: req.query.category,
      rating: req.query.rating,
      location: req.query.location,
      availability: req.query.availability,
    };

    const workers = await workerService.getAllWorkers(filters);

    res.status(200).json({
      success: true,
      message: 'Workers retrieved successfully',
      data: {
        workers,
      }
    });
  } catch (error) {
    console.error('Get all workers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve workers',
    });
  }
}

/**
 * Get worker profile with basic stats
 * GET /api/workers/:id/profile
 */
async function getWorkerProfile(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Worker ID is required'
      });
    }

    const profile = await workerService.getWorkerDetailedProfile(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Worker profile retrieved successfully',
      data: {
        profile,
      }
    });
  } catch (error) {
    console.error('Get worker profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve worker profile',
    });
  }
}

/**
 * Get worker detailed profile with recent jobs
 * GET /api/workers/:id/detailed-profile
 */
async function getWorkerDetailedProfile(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Worker ID is required'
      });
    }

    const profile = await workerService.getWorkerDetailedProfile(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Worker detailed profile retrieved successfully',
      data: {
        profile,
      }
    });
  } catch (error) {
    console.error('Get worker detailed profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve worker detailed profile',
    });
  }
}

/**
 * Get worker statistics
 * GET /api/workers/:id/stats
 */
async function getWorkerStats(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Worker ID is required'
      });
    }

    const stats = await workerService.getWorkerStats(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Worker stats retrieved successfully',
      data: {
        stats,
      }
    });
  } catch (error) {
    console.error('Get worker stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve worker stats',
    });
  }
}

/**
 * Search workers
 * GET /api/workers/search?q=plumber
 */
async function searchWorkers(req, res) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const workers = await workerService.searchWorkers(q);

    res.status(200).json({
      success: true,
      message: 'Workers search completed successfully',
      data: {
        workers,
      }
    });
  } catch (error) {
    console.error('Search workers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search workers',
    });
  }
}

module.exports = {
  getAllWorkers,
  getWorkerProfile,
  getWorkerDetailedProfile,
  getWorkerStats,
  searchWorkers,
};
