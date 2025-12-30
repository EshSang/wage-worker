const adminService = require('../services/admin.service');

/**
 * Get all users with filters
 * GET /api/admin/users?usertype=USER&search=john&page=1&limit=20
 */
async function getAllUsers(req, res) {
  try {
    const { usertype, search, page, limit } = req.query;

    const filters = {};
    if (usertype) filters.usertype = usertype;
    if (search) filters.search = search;
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);

    const result = await adminService.getAllUsers(filters);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve users',
    });
  }
}

/**
 * Get user statistics
 * GET /api/admin/users/statistics
 */
async function getUserStatistics(req, res) {
  try {
    const stats = await adminService.getUserStatistics();

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve statistics',
    });
  }
}

/**
 * Get single user by ID
 * GET /api/admin/users/:userId
 */
async function getUserById(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const user = await adminService.getUserById(userId);

    res.status(200).json({
      success: true,
      message: 'User details retrieved successfully',
      data: user,
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    const statusCode = error.message === 'User not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve user details',
    });
  }
}

/**
 * Create new user
 * POST /api/admin/users
 */
async function createUser(req, res) {
  try {
    const userData = req.body;

    // Validation
    if (!userData.email || !userData.password || !userData.fname || !userData.lname) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required',
      });
    }

    const user = await adminService.createUser(userData);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    console.error('Create user error:', error);
    const statusCode = error.message === 'Email already exists' ? 409 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create user',
    });
  }
}

/**
 * Update user
 * PUT /api/admin/users/:userId
 */
async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const userData = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const user = await adminService.updateUser(userId, userData);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    let statusCode = 400;
    if (error.message === 'User not found') statusCode = 404;
    if (error.message === 'Email already taken') statusCode = 409;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update user',
    });
  }
}

/**
 * Delete user
 * DELETE /api/admin/users/:userId
 */
async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Prevent admin from deleting themselves
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await adminService.deleteUser(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    let statusCode = 400;
    if (error.message === 'User not found') statusCode = 404;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete user',
    });
  }
}

/**
 * Get all jobs with filters (Admin)
 * GET /api/admin/jobs?search=plumbing&status=Open&categoryId=1&date=2025-12-20&page=1&limit=20
 */
async function getAllJobs(req, res) {
  try {
    const { search, status, categoryId, date, page, limit } = req.query;

    const filters = {};
    if (search) filters.search = search;
    if (status) filters.status = status;
    if (categoryId) filters.categoryId = categoryId;
    if (date) filters.date = date;
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);

    const result = await adminService.getAllJobs(filters);

    res.status(200).json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve jobs',
    });
  }
}

/**
 * Get job statistics (Admin)
 * GET /api/admin/jobs/statistics
 */
async function getJobStatistics(req, res) {
  try {
    const stats = await adminService.getJobStatistics();

    res.status(200).json({
      success: true,
      message: 'Job statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    console.error('Get job statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve statistics',
    });
  }
}

/**
 * Get single job by ID (Admin)
 * GET /api/admin/jobs/:jobId
 */
async function getJobById(req, res) {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required',
      });
    }

    const job = await adminService.getJobById(jobId);

    res.status(200).json({
      success: true,
      message: 'Job details retrieved successfully',
      data: job,
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    const statusCode = error.message === 'Job not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve job details',
    });
  }
}

/**
 * Get all earnings with filters (Admin)
 * GET /api/admin/earnings?status=COMPLETED&categoryId=1&fromDate=2025-01-01&toDate=2025-12-31&page=1&limit=20
 */
async function getAllEarnings(req, res) {
  try {
    const { status, categoryId, fromDate, toDate, page, limit } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (categoryId) filters.categoryId = categoryId;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);

    const result = await adminService.getAllEarnings(filters);

    res.status(200).json({
      success: true,
      message: 'Earnings retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Get all earnings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve earnings',
    });
  }
}

/**
 * Get earnings statistics (Admin)
 * GET /api/admin/earnings/statistics
 */
async function getEarningsStatistics(req, res) {
  try {
    const stats = await adminService.getEarningsStatistics();

    res.status(200).json({
      success: true,
      message: 'Earnings statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    console.error('Get earnings statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve statistics',
    });
  }
}

/**
 * Get dashboard statistics (Admin)
 * GET /api/admin/dashboard/statistics
 */
async function getDashboardStatistics(req, res) {
  try {
    const stats = await adminService.getDashboardStatistics();

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    console.error('Get dashboard statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve dashboard statistics',
    });
  }
}

/**
 * Get recent job requests (Admin)
 * GET /api/admin/dashboard/recent-jobs?limit=10
 */
async function getRecentJobRequests(req, res) {
  try {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit) : 10;

    const jobs = await adminService.getRecentJobRequests(limitNum);

    res.status(200).json({
      success: true,
      message: 'Recent job requests retrieved successfully',
      data: jobs,
    });
  } catch (error) {
    console.error('Get recent job requests error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve recent job requests',
    });
  }
}

module.exports = {
  getAllUsers,
  getUserStatistics,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllJobs,
  getJobStatistics,
  getJobById,
  getAllEarnings,
  getEarningsStatistics,
  getDashboardStatistics,
  getRecentJobRequests,
};
