const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const prisma = new PrismaClient();

/**
 * Get report data for a specific month and year
 */
async function getMonthlyReportData(month, year) {
  try {
    // Parse month and year
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Create date range for the specified month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

    // Get all jobs for the month
    const jobs = await prisma.job.findMany({
      where: {
        postedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
        orders: true,
      },
    });

    // Get all orders for the month
    const completedOrders = await prisma.order.findMany({
      where: {
        completedDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      include: {
        job: {
          include: {
            category: true,
          },
        },
      },
    });

    // Get earnings for the month
    const earnings = await prisma.earning.findMany({
      where: {
        earnedDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
    });

    // Calculate total revenue
    const totalRevenue = earnings.reduce((sum, earning) => sum + earning.amount, 0);

    // Group by category
    const categoryStats = {};
    jobs.forEach(job => {
      const categoryName = job.category?.category || 'Uncategorized';
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          totalJobs: 0,
          completedJobs: 0,
        };
      }
      categoryStats[categoryName].totalJobs++;
    });

    completedOrders.forEach(order => {
      const categoryName = order.job?.category?.category || 'Uncategorized';
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          totalJobs: 0,
          completedJobs: 0,
        };
      }
      categoryStats[categoryName].completedJobs++;
    });

    return {
      period: `${getMonthName(monthNum)} ${yearNum}`,
      totalJobs: jobs.length,
      completedJobs: completedOrders.length,
      pendingJobs: jobs.length - completedOrders.length,
      totalRevenue,
      categoryStats,
      month: monthNum,
      year: yearNum,
    };
  } catch (error) {
    console.error('Error in getMonthlyReportData:', error);
    throw error;
  }
}

/**
 * Get monthly statistics for the entire year
 */
async function getYearlyReportData(year) {
  try {
    const yearNum = parseInt(year);
    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(yearNum, month - 1, 1);
      const endDate = new Date(yearNum, month, 0, 23, 59, 59, 999);

      const [jobCount, completedOrderCount, earningsResult] = await Promise.all([
        prisma.job.count({
          where: {
            postedDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        prisma.order.count({
          where: {
            completedDate: {
              gte: startDate,
              lte: endDate,
            },
            status: 'COMPLETED',
          },
        }),
        prisma.earning.aggregate({
          where: {
            earnedDate: {
              gte: startDate,
              lte: endDate,
            },
            status: 'COMPLETED',
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

      monthlyData.push({
        month: getMonthName(month),
        monthNum: month,
        jobs: jobCount,
        completedJobs: completedOrderCount,
        revenue: earningsResult._sum.amount || 0,
      });
    }

    return {
      year: yearNum,
      monthlyData,
    };
  } catch (error) {
    console.error('Error in getYearlyReportData:', error);
    throw error;
  }
}

/**
 * Generate PDF report
 */
async function generatePDFReport(month, year) {
  try {
    const reportData = await getMonthlyReportData(month, year);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Buffer to store PDF data
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    // PDF Header
    doc.fontSize(20).font('Helvetica-Bold').text('Wage Worker Management System', { align: 'center' });
    doc.fontSize(16).font('Helvetica').text('Monthly Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Period: ${reportData.period}`, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Summary Section
    doc.fontSize(14).font('Helvetica-Bold').text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Jobs Posted: ${reportData.totalJobs}`);
    doc.text(`Completed Jobs: ${reportData.completedJobs}`);
    doc.text(`Pending Jobs: ${reportData.pendingJobs}`);
    doc.text(`Total Revenue: LKR ${reportData.totalRevenue.toLocaleString()}`);
    doc.moveDown(2);

    // Category Statistics
    doc.fontSize(14).font('Helvetica-Bold').text('Category Breakdown', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');

    // Table header
    const tableTop = doc.y;
    const col1X = 50;
    const col2X = 250;
    const col3X = 400;

    doc.font('Helvetica-Bold');
    doc.text('Category', col1X, tableTop);
    doc.text('Total Jobs', col2X, tableTop);
    doc.text('Completed', col3X, tableTop);
    doc.moveDown(0.5);

    // Draw line under header
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Table rows
    doc.font('Helvetica');
    Object.entries(reportData.categoryStats).forEach(([category, stats]) => {
      const rowY = doc.y;
      doc.text(category, col1X, rowY);
      doc.text(stats.totalJobs.toString(), col2X, rowY);
      doc.text(stats.completedJobs.toString(), col3X, rowY);
      doc.moveDown(0.5);
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(9).text('This is a system-generated report.', { align: 'center', color: 'gray' });

    doc.end();

    // Return promise that resolves with PDF buffer
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });
  } catch (error) {
    console.error('Error in generatePDFReport:', error);
    throw error;
  }
}

/**
 * Generate Excel report
 */
async function generateExcelReport(month, year) {
  try {
    const reportData = await getMonthlyReportData(month, year);
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Wage Worker Management System';
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');

    // Set column widths
    summarySheet.columns = [
      { width: 30 },
      { width: 20 },
    ];

    // Title
    summarySheet.mergeCells('A1:B1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'Wage Worker Management System - Monthly Report';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Period info
    summarySheet.mergeCells('A2:B2');
    const periodCell = summarySheet.getCell('A2');
    periodCell.value = `Period: ${reportData.period}`;
    periodCell.font = { size: 12 };
    periodCell.alignment = { horizontal: 'center' };

    summarySheet.addRow([]);

    // Summary data
    summarySheet.addRow(['Metric', 'Value']).font = { bold: true };
    summarySheet.addRow(['Total Jobs Posted', reportData.totalJobs]);
    summarySheet.addRow(['Completed Jobs', reportData.completedJobs]);
    summarySheet.addRow(['Pending Jobs', reportData.pendingJobs]);
    summarySheet.addRow(['Total Revenue', `LKR ${reportData.totalRevenue.toLocaleString()}`]);

    // Style the summary table
    summarySheet.getRow(4).eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF06b6d4' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    summarySheet.addRow([]);
    summarySheet.addRow([]);

    // Category breakdown
    summarySheet.addRow(['Category Breakdown']).font = { bold: true, size: 14 };
    summarySheet.addRow(['Category', 'Total Jobs', 'Completed Jobs']).font = { bold: true };

    const categoryHeaderRow = summarySheet.lastRow;
    categoryHeaderRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF06b6d4' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    // Set wider columns for category breakdown
    summarySheet.getColumn(1).width = 30;
    summarySheet.getColumn(2).width = 20;
    summarySheet.getColumn(3).width = 20;

    Object.entries(reportData.categoryStats).forEach(([category, stats]) => {
      summarySheet.addRow([category, stats.totalJobs, stats.completedJobs]);
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error('Error in generateExcelReport:', error);
    throw error;
  }
}

/**
 * Helper function to get month name
 */
function getMonthName(monthNum) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNum - 1];
}

module.exports = {
  getMonthlyReportData,
  getYearlyReportData,
  generatePDFReport,
  generateExcelReport,
};
