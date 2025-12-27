import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Spinner, Form } from 'react-bootstrap';
import { FaDownload, FaChartLine, FaBriefcase, FaStar, FaPercentage, FaClipboardList, FaFileDownload } from 'react-icons/fa';
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import axiosInstance from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function CustomerAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axiosInstance.get(`/api/analytics/customer?${params.toString()}`);
      console.log('Customer Analytics data:', response.data);
      setAnalytics(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchAnalytics({ startDate, endDate });
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    fetchAnalytics();
  };

  const handleDownloadReport = async (format) => {
    try {
      setDownloading(true);
      const params = new URLSearchParams();
      params.append('format', format);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await axiosInstance.get(`/api/analytics/customer/report?${params.toString()}`, {
        responseType: format === 'csv' ? 'blob' : 'json',
      });

      const blob = format === 'csv' ? response.data : new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customer-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Report downloaded successfully as ${format.toUpperCase()}`);
      setDownloading(false);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <TopNavbar />
        <div className="text-center py-5">
          <Spinner animation="border" variant="info" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading analytics data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-light min-vh-100">
        <TopNavbar />
        <Container className="my-5 text-center">
          <h3>No analytics data available</h3>
          <p className="text-muted">Post some jobs to see your analytics</p>
        </Container>
        <Footer />
      </div>
    );
  }

  const { summary, spendingTrend, jobsByCategory, workerRatingsDistribution, jobStatusDistribution, monthlyComparison } = analytics;

  // Spending Trend Line Chart
  const spendingTrendData = {
    labels: spendingTrend.map((item) => item.month),
    datasets: [
      {
        label: 'Spending (LKR)',
        data: spendingTrend.map((item) => item.amount),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Jobs by Category Bar Chart
  const jobsByCategoryData = {
    labels: jobsByCategory.map((cat) => cat.category),
    datasets: [
      {
        label: 'Jobs Posted',
        data: jobsByCategory.map((cat) => cat.jobsPosted),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
      {
        label: 'Jobs Completed',
        data: jobsByCategory.map((cat) => cat.jobsCompleted),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
    ],
  };

  // Worker Ratings Distribution Bar Chart
  const workerRatingsData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Number of Reviews',
        data: [
          workerRatingsDistribution[1] || 0,
          workerRatingsDistribution[2] || 0,
          workerRatingsDistribution[3] || 0,
          workerRatingsDistribution[4] || 0,
          workerRatingsDistribution[5] || 0,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
        ],
      },
    ],
  };

  // Job Status Distribution Doughnut Chart
  const jobStatusData = {
    labels: ['Open', 'In Progress', 'Completed', 'Closed'],
    datasets: [
      {
        data: [
          jobStatusDistribution.open,
          jobStatusDistribution.inProgress,
          jobStatusDistribution.completed,
          jobStatusDistribution.closed,
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(201, 203, 207, 0.8)',
        ],
      },
    ],
  };

  // Monthly Comparison Grouped Bar Chart
  const monthlyComparisonData = {
    labels: monthlyComparison.map((item) => item.month),
    datasets: [
      {
        label: 'Jobs Posted',
        data: monthlyComparison.map((item) => item.jobsPosted),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        yAxisID: 'y',
      },
      {
        label: 'Jobs Completed',
        data: monthlyComparison.map((item) => item.jobsCompleted),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        yAxisID: 'y',
      },
      {
        label: 'Spending (LKR)',
        data: monthlyComparison.map((item) => item.spent),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        yAxisID: 'y1',
      },
    ],
  };

  const monthlyComparisonOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Jobs Count',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Spending (LKR)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="bg-light min-vh-100">
      <TopNavbar />

      <Container className="my-4">
        {/* Header with Filters and Download */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">Analytics & Reports</h2>
            <p className="text-muted mb-0">Comprehensive insights into your hiring performance</p>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="success"
              onClick={() => handleDownloadReport('csv')}
              disabled={downloading}
            >
              <FaFileDownload className="me-2" />
              {downloading ? 'Downloading...' : 'Download CSV'}
            </Button>
            <Button
              variant="info"
              onClick={() => handleDownloadReport('json')}
              disabled={downloading}
            >
              <FaDownload className="me-2" />
              {downloading ? 'Downloading...' : 'Download JSON'}
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <h6 className="fw-bold mb-3">Filter by Date Range</h6>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex align-items-end gap-2">
                <Button variant="primary" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
                <Button variant="outline-secondary" onClick={handleResetFilters}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Summary Stats Cards */}
        <Row className="g-3 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 bg-primary bg-opacity-10">
              <Card.Body className="text-center">
                <FaBriefcase size={40} className="text-primary mb-2" />
                <h6 className="text-muted">Total Jobs Posted</h6>
                <h3 className="fw-bold mb-0">{summary.totalJobsPosted}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 bg-danger bg-opacity-10">
              <Card.Body className="text-center">
                <FaChartLine size={40} className="text-danger mb-2" />
                <h6 className="text-muted">Total Spent</h6>
                <h3 className="fw-bold mb-0">LKR {summary.totalSpent.toLocaleString()}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 bg-success bg-opacity-10">
              <Card.Body className="text-center">
                <FaClipboardList size={40} className="text-success mb-2" />
                <h6 className="text-muted">Completed Jobs</h6>
                <h3 className="fw-bold mb-0">{summary.completedJobs}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 bg-warning bg-opacity-10">
              <Card.Body className="text-center">
                <FaStar size={40} className="text-warning mb-2" />
                <h6 className="text-muted">Avg Worker Rating</h6>
                <h3 className="fw-bold mb-0">{summary.averageWorkerRating} / 5</h3>
                <small className="text-muted">({summary.totalReviews} reviews)</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Additional Stats */}
        <Row className="g-3 mb-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <FaBriefcase size={30} className="text-info mb-2" />
                <h6 className="text-muted">Active Jobs</h6>
                <h4 className="fw-bold mb-0">{summary.activeJobs}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <FaPercentage size={30} className="text-primary mb-2" />
                <h6 className="text-muted">Application Response Rate</h6>
                <h4 className="fw-bold mb-0">{summary.applicationResponseRate}%</h4>
                <small className="text-muted">
                  {summary.approvedApplications}/{summary.totalApplicationsReceived} responded
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Row 1 */}
        <Row className="g-4 mb-4">
          <Col md={8}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold mb-3">Spending Trend Over Time</h6>
                {spendingTrend.length > 0 ? (
                  <Line data={spendingTrendData} options={{ maintainAspectRatio: true }} />
                ) : (
                  <p className="text-muted text-center py-5">No spending data available</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold mb-3">Job Status Distribution</h6>
                {(jobStatusDistribution.open + jobStatusDistribution.inProgress + jobStatusDistribution.completed + jobStatusDistribution.closed) > 0 ? (
                  <Doughnut data={jobStatusData} />
                ) : (
                  <p className="text-muted text-center py-5">No job data</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Row 2 */}
        <Row className="g-4 mb-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold mb-3">Jobs by Category</h6>
                {jobsByCategory.length > 0 ? (
                  <Bar data={jobsByCategoryData} options={{ maintainAspectRatio: true }} />
                ) : (
                  <p className="text-muted text-center py-5">No category data available</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold mb-3">Worker Ratings Distribution</h6>
                {summary.totalReviews > 0 ? (
                  <Bar data={workerRatingsData} options={{ maintainAspectRatio: true }} />
                ) : (
                  <p className="text-muted text-center py-5">No rating data available</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Monthly Comparison Chart */}
        <Row className="g-4 mb-4">
          <Col md={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold mb-3">Monthly Comparison (Jobs Posted vs Completed vs Spending)</h6>
                {monthlyComparison.length > 0 ? (
                  <Bar data={monthlyComparisonData} options={monthlyComparisonOptions} />
                ) : (
                  <p className="text-muted text-center py-5">No monthly data available</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
