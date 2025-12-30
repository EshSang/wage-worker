const reportService = require('../services/report.service');

/**
 * Get monthly report data
 * GET /api/admin/reports/monthly?month=1&year=2025
 */
async function getMonthlyReport(req, res) {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required',
      });
    }

    const reportData = await reportService.getMonthlyReportData(month, year);

    res.status(200).json({
      success: true,
      message: 'Monthly report retrieved successfully',
      data: reportData,
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve monthly report',
    });
  }
}

/**
 * Get yearly report data
 * GET /api/admin/reports/yearly?year=2025
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

    const reportData = await reportService.getYearlyReportData(year);

    res.status(200).json({
      success: true,
      message: 'Yearly report retrieved successfully',
      data: reportData,
    });
  } catch (error) {
    console.error('Get yearly report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve yearly report',
    });
  }
}

/**
 * Download report as PDF
 * GET /api/admin/reports/download/pdf?month=1&year=2025
 */
async function downloadPDFReport(req, res) {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required',
      });
    }

    const pdfBuffer = await reportService.generatePDFReport(month, year);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="report-${year}-${month.toString().padStart(2, '0')}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download PDF report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate PDF report',
    });
  }
}

/**
 * Download report as Excel
 * GET /api/admin/reports/download/excel?month=1&year=2025
 */
async function downloadExcelReport(req, res) {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required',
      });
    }

    const excelBuffer = await reportService.generateExcelReport(month, year);

    // Set response headers for Excel download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="report-${year}-${month.toString().padStart(2, '0')}.xlsx"`
    );
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);
  } catch (error) {
    console.error('Download Excel report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate Excel report',
    });
  }
}

module.exports = {
  getMonthlyReport,
  getYearlyReport,
  downloadPDFReport,
  downloadExcelReport,
};
