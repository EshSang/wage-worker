const reviewerService = require('../services/reviewer.service');
const notificationService = require('../services/notification.service');

/**
 * Get reviewer dashboard statistics
 */
async function getDashboardStatistics(req, res) {
  try {
    const statistics = await reviewerService.getReviewerDashboardStats();

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error('Error in getDashboardStatistics controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
    });
  }
}

/**
 * Get all orders for reviewer
 */
async function getAllOrders(req, res) {
  try {
    const { status, search, page, limit } = req.query;

    const filters = {
      status,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };

    const result = await reviewerService.getAllOrdersForReviewer(filters);

    res.status(200).json({
      success: true,
      data: result.orders,
      pagination: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: filters.limit,
      },
    });
  } catch (error) {
    console.error('Error in getAllOrders controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
}

/**
 * Get pending jobs awaiting approval
 */
async function getPendingJobs(req, res) {
  try {
    const { search, page, limit } = req.query;

    const filters = {
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };

    const result = await reviewerService.getPendingJobs(filters);

    res.status(200).json({
      success: true,
      data: result.jobs,
      pagination: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: filters.limit,
      },
    });
  } catch (error) {
    console.error('Error in getPendingJobs controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending jobs',
      error: error.message,
    });
  }
}

/**
 * Get all jobs for reviewer
 */
async function getAllJobs(req, res) {
  try {
    const { approvalStatus, search, page, limit } = req.query;

    const filters = {
      approvalStatus,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };

    const result = await reviewerService.getAllJobsForReviewer(filters);

    res.status(200).json({
      success: true,
      data: result.jobs,
      pagination: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: filters.limit,
      },
    });
  } catch (error) {
    console.error('Error in getAllJobs controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message,
    });
  }
}

/**
 * Approve a job
 */
async function approveJob(req, res) {
  try {
    const { jobId } = req.params;
    const reviewerId = req.user.id;

    const updatedJob = await reviewerService.approveJob(parseInt(jobId), reviewerId);

    // Send notification to job creator
    await notificationService.createNotification({
      userId: updatedJob.createdUserId,
      type: 'JOB_APPROVED',
      title: 'Job Approved',
      message: `Your job "${updatedJob.title}" has been approved and is now visible to workers.`,
      relatedId: updatedJob.id,
      relatedType: 'JOB',
    });

    res.status(200).json({
      success: true,
      message: 'Job approved successfully',
      data: updatedJob,
    });
  } catch (error) {
    console.error('Error in approveJob controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve job',
      error: error.message,
    });
  }
}

/**
 * Reject a job
 */
async function rejectJob(req, res) {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;
    const reviewerId = req.user.id;

    const updatedJob = await reviewerService.rejectJob(parseInt(jobId), reviewerId, reason);

    // Send notification to job creator
    await notificationService.createNotification({
      userId: updatedJob.createdUserId,
      type: 'JOB_REJECTED',
      title: 'Job Rejected',
      message: `Your job "${updatedJob.title}" has been rejected. ${reason ? 'Reason: ' + reason : ''}`,
      relatedId: updatedJob.id,
      relatedType: 'JOB',
    });

    res.status(200).json({
      success: true,
      message: 'Job rejected successfully',
      data: updatedJob,
    });
  } catch (error) {
    console.error('Error in rejectJob controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject job',
      error: error.message,
    });
  }
}

/**
 * Get pending reviews awaiting approval
 */
async function getPendingReviews(req, res) {
  try {
    const { search, page, limit } = req.query;

    const filters = {
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };

    const result = await reviewerService.getPendingReviews(filters);

    res.status(200).json({
      success: true,
      data: result.reviews,
      pagination: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: filters.limit,
      },
    });
  } catch (error) {
    console.error('Error in getPendingReviews controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending reviews',
      error: error.message,
    });
  }
}

/**
 * Get all reviews for reviewer
 */
async function getAllReviews(req, res) {
  try {
    const { approvalStatus, search, page, limit } = req.query;

    const filters = {
      approvalStatus,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };

    const result = await reviewerService.getAllReviewsForReviewer(filters);

    res.status(200).json({
      success: true,
      data: result.reviews,
      pagination: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: filters.limit,
      },
    });
  } catch (error) {
    console.error('Error in getAllReviews controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
}

/**
 * Approve a review
 */
async function approveReview(req, res) {
  try {
    const { reviewId } = req.params;
    const reviewerId = req.user.id;

    const updatedReview = await reviewerService.approveReview(parseInt(reviewId), reviewerId);

    // Send notification to review author
    await notificationService.createNotification({
      userId: updatedReview.reviewerId,
      type: 'REVIEW_APPROVED',
      title: 'Review Approved',
      message: 'Your review has been approved and is now visible.',
      relatedId: updatedReview.id,
      relatedType: 'REVIEW',
    });

    // Send notification to the worker (job owner)
    if (updatedReview.order && updatedReview.order.job) {
      await notificationService.createNotification({
        userId: updatedReview.order.job.createdUserId,
        type: 'REVIEW_RECEIVED',
        title: 'New Review Received',
        message: `You received a new review with ${updatedReview.rating} stars.`,
        relatedId: updatedReview.id,
        relatedType: 'REVIEW',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review approved successfully',
      data: updatedReview,
    });
  } catch (error) {
    console.error('Error in approveReview controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve review',
      error: error.message,
    });
  }
}

/**
 * Reject a review
 */
async function rejectReview(req, res) {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const reviewerId = req.user.id;

    const updatedReview = await reviewerService.rejectReview(parseInt(reviewId), reviewerId, reason);

    // Send notification to review author
    await notificationService.createNotification({
      userId: updatedReview.reviewerId,
      type: 'REVIEW_REJECTED',
      title: 'Review Rejected',
      message: `Your review has been rejected. ${reason ? 'Reason: ' + reason : ''}`,
      relatedId: updatedReview.id,
      relatedType: 'REVIEW',
    });

    res.status(200).json({
      success: true,
      message: 'Review rejected successfully',
      data: updatedReview,
    });
  } catch (error) {
    console.error('Error in rejectReview controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject review',
      error: error.message,
    });
  }
}

/**
 * Get yearly report data
 */
async function getYearlyReport(req, res) {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Year is required',
      });
    }

    const reportData = await reviewerService.getYearlyReportData(parseInt(year));

    res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error('Error in getYearlyReport controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch yearly report',
      error: error.message,
    });
  }
}

/**
 * Download report (PDF or Excel)
 */
async function downloadReport(req, res) {
  try {
    const { format } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required',
      });
    }

    const reportData = await reviewerService.getMonthlyReportData(parseInt(month), parseInt(year));

    if (format === 'pdf') {
      // Generate PDF
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reviewer-report-${year}-${month}.pdf`);

      doc.pipe(res);

      // Header
      doc.fontSize(20).text('Reviewer Activity Report', { align: 'center' });
      doc.fontSize(12).text(`Month: ${month}/${year}`, { align: 'center' });
      doc.moveDown();

      // Summary
      doc.fontSize(16).text('Summary', { underline: true });
      doc.fontSize(12);
      doc.text(`Total Approved Jobs: ${reportData.summary.totalApprovedJobs}`);
      doc.text(`Total Rejected Jobs: ${reportData.summary.totalRejectedJobs}`);
      doc.text(`Total Approved Reviews: ${reportData.summary.totalApprovedReviews}`);
      doc.text(`Total Rejected Reviews: ${reportData.summary.totalRejectedReviews}`);
      doc.moveDown();

      // Approved Jobs
      if (reportData.approvedJobs.length > 0) {
        doc.fontSize(16).text('Approved Jobs', { underline: true });
        doc.fontSize(10);
        reportData.approvedJobs.forEach((job, index) => {
          doc.text(`${index + 1}. ${job.title} - ${job.category.category}`);
          doc.text(`   Posted by: ${job.createdUser.fname} ${job.createdUser.lname}`);
          doc.text(`   Reviewed: ${new Date(job.reviewedAt).toLocaleDateString()}`);
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }

      // Rejected Jobs
      if (reportData.rejectedJobs.length > 0) {
        doc.fontSize(16).text('Rejected Jobs', { underline: true });
        doc.fontSize(10);
        reportData.rejectedJobs.forEach((job, index) => {
          doc.text(`${index + 1}. ${job.title} - ${job.category.category}`);
          doc.text(`   Posted by: ${job.createdUser.fname} ${job.createdUser.lname}`);
          doc.text(`   Reviewed: ${new Date(job.reviewedAt).toLocaleDateString()}`);
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }

      // Footer
      doc.fontSize(8).text(
        `Generated on ${new Date().toLocaleDateString()}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

      doc.end();

    } else if (format === 'excel') {
      // Generate Excel
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();

      // Summary Sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Count', key: 'count', width: 15 },
      ];
      summarySheet.addRows([
        { metric: 'Total Approved Jobs', count: reportData.summary.totalApprovedJobs },
        { metric: 'Total Rejected Jobs', count: reportData.summary.totalRejectedJobs },
        { metric: 'Total Approved Reviews', count: reportData.summary.totalApprovedReviews },
        { metric: 'Total Rejected Reviews', count: reportData.summary.totalRejectedReviews },
      ]);

      // Approved Jobs Sheet
      const approvedJobsSheet = workbook.addWorksheet('Approved Jobs');
      approvedJobsSheet.columns = [
        { header: 'Job Title', key: 'title', width: 30 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Posted By', key: 'postedBy', width: 25 },
        { header: 'Reviewed Date', key: 'reviewedDate', width: 15 },
      ];
      approvedJobsSheet.addRows(
        reportData.approvedJobs.map(job => ({
          title: job.title,
          category: job.category.category,
          postedBy: `${job.createdUser.fname} ${job.createdUser.lname}`,
          reviewedDate: new Date(job.reviewedAt).toLocaleDateString(),
        }))
      );

      // Rejected Jobs Sheet
      const rejectedJobsSheet = workbook.addWorksheet('Rejected Jobs');
      rejectedJobsSheet.columns = [
        { header: 'Job Title', key: 'title', width: 30 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Posted By', key: 'postedBy', width: 25 },
        { header: 'Reviewed Date', key: 'reviewedDate', width: 15 },
      ];
      rejectedJobsSheet.addRows(
        reportData.rejectedJobs.map(job => ({
          title: job.title,
          category: job.category.category,
          postedBy: `${job.createdUser.fname} ${job.createdUser.lname}`,
          reviewedDate: new Date(job.reviewedAt).toLocaleDateString(),
        }))
      );

      // Approved Reviews Sheet
      const approvedReviewsSheet = workbook.addWorksheet('Approved Reviews');
      approvedReviewsSheet.columns = [
        { header: 'Job Title', key: 'jobTitle', width: 30 },
        { header: 'Rating', key: 'rating', width: 10 },
        { header: 'Reviewer', key: 'reviewer', width: 25 },
        { header: 'Reviewed Date', key: 'reviewedDate', width: 15 },
      ];
      approvedReviewsSheet.addRows(
        reportData.approvedReviews.map(review => ({
          jobTitle: review.order.job.title,
          rating: review.rating,
          reviewer: `${review.reviewer.fname} ${review.reviewer.lname}`,
          reviewedDate: new Date(review.reviewedAt).toLocaleDateString(),
        }))
      );

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=reviewer-report-${year}-${month}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid format. Use "pdf" or "excel"',
      });
    }
  } catch (error) {
    console.error('Error in downloadReport controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message,
    });
  }
}

module.exports = {
  getDashboardStatistics,
  getAllOrders,
  getPendingJobs,
  getAllJobs,
  approveJob,
  rejectJob,
  getPendingReviews,
  getAllReviews,
  approveReview,
  rejectReview,
  getYearlyReport,
  downloadReport,
};
