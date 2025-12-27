const prisma = require('../config/prisma');

class AnalyticsService {
  /**
   * Get comprehensive analytics data for a worker
   * @param {number} workerId - Worker user ID
   * @param {Object} dateRange - Optional start and end dates
   * @returns {Promise<Object>} Analytics data with charts and metrics
   */
  async getWorkerAnalytics(workerId, dateRange = {}) {
    const { startDate, endDate } = dateRange;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.earnedDate = {};
      if (startDate) dateFilter.earnedDate.gte = new Date(startDate);
      if (endDate) dateFilter.earnedDate.lte = new Date(endDate);
    }

    // Fetch all necessary data in parallel
    const [earnings, applications, reviews, orders] = await Promise.all([
      // Get earnings data
      prisma.earning.findMany({
        where: {
          workerId,
          status: 'COMPLETED',
          ...dateFilter,
        },
        include: {
          job: {
            include: { category: true },
          },
        },
        orderBy: { earnedDate: 'asc' },
      }),

      // Get applications data
      prisma.jobApplication.findMany({
        where: {
          userId: workerId,
          ...(startDate || endDate
            ? {
                appliedDate: {
                  ...(startDate ? { gte: new Date(startDate) } : {}),
                  ...(endDate ? { lte: new Date(endDate) } : {}),
                },
              }
            : {}),
        },
      }),

      // Get reviews data
      prisma.review.findMany({
        where: {
          order: {
            userId: workerId,
          },
          ...(startDate || endDate
            ? {
                createdAt: {
                  ...(startDate ? { gte: new Date(startDate) } : {}),
                  ...(endDate ? { lte: new Date(endDate) } : {}),
                },
              }
            : {}),
        },
        orderBy: { createdAt: 'asc' },
      }),

      // Get orders for hours calculation
      prisma.order.findMany({
        where: {
          userId: workerId,
          status: 'COMPLETED',
          ...(startDate || endDate
            ? {
                completedDate: {
                  ...(startDate ? { gte: new Date(startDate) } : {}),
                  ...(endDate ? { lte: new Date(endDate) } : {}),
                },
              }
            : {}),
        },
      }),
    ]);

    // Calculate summary statistics
    const summary = this._calculateSummary(earnings, applications, reviews, orders);

    // Calculate earnings trend (monthly)
    const earningsTrend = this._calculateEarningsTrend(earnings);

    // Calculate rating trend (monthly)
    const ratingTrend = this._calculateRatingTrend(reviews);

    // Calculate top categories
    const topCategories = this._calculateTopCategories(earnings);

    // Calculate application success rate breakdown
    const applicationStats = this._calculateApplicationStats(applications);

    // Calculate monthly comparison
    const monthlyComparison = this._calculateMonthlyComparison(earnings, reviews);

    return {
      summary,
      earningsTrend,
      ratingTrend,
      topCategories,
      applicationStats,
      monthlyComparison,
    };
  }

  /**
   * Calculate summary statistics
   */
  _calculateSummary(earnings, applications, reviews, orders) {
    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const completedJobs = earnings.length;
    const totalApplications = applications.length;
    const approvedApplications = applications.filter(
      (a) => a.applicationStatus === 'APPROVED'
    ).length;
    const applicationSuccessRate =
      totalApplications > 0
        ? Math.round((approvedApplications / totalApplications) * 100)
        : 0;

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating =
      reviews.length > 0 ? parseFloat((totalRating / reviews.length).toFixed(1)) : 0;

    // Calculate total hours worked (estimate based on days)
    let totalHoursWorked = 0;
    orders.forEach((order) => {
      if (order.startedDate && order.completedDate) {
        const start = new Date(order.startedDate);
        const end = new Date(order.completedDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        totalHoursWorked += days > 0 ? days * 8 : 8;
      } else {
        totalHoursWorked += 8; // Default 8 hours
      }
    });

    return {
      totalEarnings: Math.round(totalEarnings),
      completedJobs,
      averageRating,
      totalReviews: reviews.length,
      applicationSuccessRate,
      totalHoursWorked,
      totalApplications,
      approvedApplications,
      rejectedApplications: applications.filter(
        (a) => a.applicationStatus === 'REJECTED'
      ).length,
    };
  }

  /**
   * Calculate earnings trend by month
   */
  _calculateEarningsTrend(earnings) {
    const monthlyData = {};

    earnings.forEach((earning) => {
      const date = new Date(earning.earnedDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          amount: 0,
          jobs: 0,
        };
      }

      monthlyData[monthKey].amount += earning.amount;
      monthlyData[monthKey].jobs += 1;
    });

    return Object.values(monthlyData)
      .map((data) => ({
        ...data,
        amount: Math.round(data.amount),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Calculate rating trend by month
   */
  _calculateRatingTrend(reviews) {
    const monthlyData = {};

    reviews.forEach((review) => {
      const date = new Date(review.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          totalRating: 0,
          count: 0,
        };
      }

      monthlyData[monthKey].totalRating += review.rating;
      monthlyData[monthKey].count += 1;
    });

    return Object.values(monthlyData)
      .map((data) => ({
        month: data.month,
        avgRating: data.count > 0 ? parseFloat((data.totalRating / data.count).toFixed(1)) : 0,
        reviewCount: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Calculate top job categories by earnings and count
   */
  _calculateTopCategories(earnings) {
    const categoryData = {};

    earnings.forEach((earning) => {
      const categoryName = earning.job.category?.category || 'Other';

      if (!categoryData[categoryName]) {
        categoryData[categoryName] = {
          category: categoryName,
          jobs: 0,
          earnings: 0,
        };
      }

      categoryData[categoryName].jobs += 1;
      categoryData[categoryName].earnings += earning.amount;
    });

    return Object.values(categoryData)
      .map((data) => ({
        ...data,
        earnings: Math.round(data.earnings),
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 10); // Top 10 categories
  }

  /**
   * Calculate application statistics breakdown
   */
  _calculateApplicationStats(applications) {
    const stats = {
      total: applications.length,
      approved: 0,
      rejected: 0,
      pending: 0,
      applied: 0,
    };

    applications.forEach((app) => {
      const status = app.applicationStatus.toUpperCase();
      if (status === 'APPROVED') stats.approved++;
      else if (status === 'REJECTED') stats.rejected++;
      else if (status === 'PENDING') stats.pending++;
      else if (status === 'APPLIED') stats.applied++;
    });

    return stats;
  }

  /**
   * Calculate monthly comparison data
   */
  _calculateMonthlyComparison(earnings, reviews) {
    const monthlyData = {};

    // Process earnings
    earnings.forEach((earning) => {
      const date = new Date(earning.earnedDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          earnings: 0,
          jobs: 0,
          totalRating: 0,
          reviewCount: 0,
        };
      }

      monthlyData[monthKey].earnings += earning.amount;
      monthlyData[monthKey].jobs += 1;
    });

    // Process reviews
    reviews.forEach((review) => {
      const date = new Date(review.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (monthlyData[monthKey]) {
        monthlyData[monthKey].totalRating += review.rating;
        monthlyData[monthKey].reviewCount += 1;
      }
    });

    return Object.values(monthlyData)
      .map((data) => ({
        month: data.month,
        earnings: Math.round(data.earnings),
        jobs: data.jobs,
        avgRating:
          data.reviewCount > 0
            ? parseFloat((data.totalRating / data.reviewCount).toFixed(1))
            : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Generate downloadable report data
   * @param {number} workerId - Worker user ID
   * @param {string} format - 'csv' or 'json'
   * @param {Object} dateRange - Optional start and end dates
   * @returns {Promise<Object>} Report data ready for download
   */
  async generateWorkerReport(workerId, format, dateRange = {}) {
    const analytics = await this.getWorkerAnalytics(workerId, dateRange);

    if (format === 'csv') {
      return this._generateCSVReport(analytics);
    } else if (format === 'json') {
      return analytics;
    }

    throw new Error(`Unsupported format: ${format}`);
  }

  /**
   * Generate CSV format report
   */
  _generateCSVReport(analytics) {
    const { summary, earningsTrend, topCategories } = analytics;

    // Summary section
    let csv = 'Worker Analytics Report\n\n';
    csv += 'Summary Statistics\n';
    csv += 'Metric,Value\n';
    csv += `Total Earnings,LKR ${summary.totalEarnings}\n`;
    csv += `Completed Jobs,${summary.completedJobs}\n`;
    csv += `Average Rating,${summary.averageRating}\n`;
    csv += `Total Reviews,${summary.totalReviews}\n`;
    csv += `Application Success Rate,${summary.applicationSuccessRate}%\n`;
    csv += `Total Hours Worked,${summary.totalHoursWorked}\n\n`;

    // Earnings trend
    csv += 'Monthly Earnings Trend\n';
    csv += 'Month,Earnings (LKR),Jobs Completed\n';
    earningsTrend.forEach((item) => {
      csv += `${item.month},${item.amount},${item.jobs}\n`;
    });
    csv += '\n';

    // Top categories
    csv += 'Top Job Categories\n';
    csv += 'Category,Jobs Completed,Total Earnings (LKR)\n';
    topCategories.forEach((cat) => {
      csv += `${cat.category},${cat.jobs},${cat.earnings}\n`;
    });

    return csv;
  }
}

module.exports = new AnalyticsService();
