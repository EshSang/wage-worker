const directHireService = require('../services/directHire.service');
const notificationService = require('../services/notification.service');

/**
 * Create direct hire job request
 * POST /api/direct-hire/request
 */
async function createDirectHireRequest(req, res) {
  try {
    const customerId = req.user.id;
    const { workerId, title, description, categoryId, location, hourlyRate, skills, paymentIntentId } = req.body;

    // Validation
    if (!workerId || !title || !description || !categoryId || !location || !hourlyRate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: workerId, title, description, categoryId, location, hourlyRate'
      });
    }

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID is required'
      });
    }

    const result = await directHireService.createDirectHireRequest(
      customerId,
      workerId,
      { title, description, categoryId, location, hourlyRate, skills },
      paymentIntentId
    );

    // Send notification to worker (if notification service exists)
    try {
      await notificationService.createNotification(
        workerId,
        'JOB_APPLIED', // Using existing type, or add DIRECT_HIRE_REQUEST later
        'New Direct Job Request',
        `${req.user.fname} sent you a direct job request for "${title}"`,
        result.application.id,
        'APPLICATION'
      );
    } catch (notifError) {
      console.log('Notification service not available:', notifError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Direct hire request sent successfully',
      data: {
        job: result.job,
        application: result.application,
      }
    });
  } catch (error) {
    console.error('Create direct hire error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create direct hire request',
    });
  }
}

/**
 * Worker accepts direct hire request
 * PATCH /api/direct-hire/accept/:applicationId
 */
async function acceptDirectHireRequest(req, res) {
  try {
    const workerId = req.user.id;
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    const application = await directHireService.acceptDirectHireRequest(
      workerId,
      parseInt(applicationId)
    );

    // Send notification to customer (if notification service exists)
    try {
      await notificationService.createNotification(
        application.job.createdUserId,
        'APPLICATION_ACCEPTED',
        'Direct Job Request Accepted',
        `${req.user.fname} accepted your job request for "${application.job.title}"`,
        application.id,
        'APPLICATION'
      );
    } catch (notifError) {
      console.log('Notification service not available:', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Direct hire request accepted successfully',
      data: {
        application,
      }
    });
  } catch (error) {
    console.error('Accept direct hire error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to accept direct hire request',
    });
  }
}

/**
 * Worker rejects direct hire request
 * PATCH /api/direct-hire/reject/:applicationId
 */
async function rejectDirectHireRequest(req, res) {
  try {
    const workerId = req.user.id;
    const { applicationId } = req.params;
    const { reason } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    const application = await directHireService.rejectDirectHireRequest(
      workerId,
      parseInt(applicationId),
      reason
    );

    // Send notification to customer (if notification service exists)
    try {
      await notificationService.createNotification(
        application.job.createdUserId,
        'APPLICATION_REJECTED',
        'Direct Job Request Declined',
        `${req.user.fname} declined your job request for "${application.job.title}"`,
        application.id,
        'APPLICATION'
      );
    } catch (notifError) {
      console.log('Notification service not available:', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Direct hire request rejected',
      data: {
        application,
      }
    });
  } catch (error) {
    console.error('Reject direct hire error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject direct hire request',
    });
  }
}

/**
 * Get worker's direct hire requests
 * GET /api/direct-hire/requests?status=PENDING
 * GET /api/direct-hire/requests?status=PENDING,ACCEPTED (for multiple statuses)
 */
async function getWorkerRequests(req, res) {
  try {
    const workerId = req.user.id;
    const { status } = req.query;

    // Handle comma-separated status values
    let statusParam = status || 'PENDING';
    if (typeof statusParam === 'string' && statusParam.includes(',')) {
      statusParam = statusParam.split(',').map(s => s.trim());
    }

    const requests = await directHireService.getWorkerDirectHireRequests(
      workerId,
      statusParam
    );

    res.status(200).json({
      success: true,
      message: 'Direct hire requests retrieved successfully',
      data: {
        requests,
      }
    });
  } catch (error) {
    console.error('Get direct hire requests error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve direct hire requests',
    });
  }
}

/**
 * Get customer's hired workers (accepted applications)
 * GET /api/direct-hire/hired-workers
 */
async function getCustomerHiredWorkers(req, res) {
  try {
    const customerId = req.user.id;

    const hiredWorkers = await directHireService.getCustomerHiredWorkers(customerId);

    res.status(200).json({
      success: true,
      message: 'Hired workers retrieved successfully',
      data: {
        hiredWorkers,
      }
    });
  } catch (error) {
    console.error('Get hired workers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve hired workers',
    });
  }
}

module.exports = {
  createDirectHireRequest,
  acceptDirectHireRequest,
  rejectDirectHireRequest,
  getWorkerRequests,
  getCustomerHiredWorkers,
};
