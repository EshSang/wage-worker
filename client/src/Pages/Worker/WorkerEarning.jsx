import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { FaMoneyBillWave, FaBriefcase, FaChartLine, FaStar, FaCalendar } from 'react-icons/fa';
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';
import axiosInstance from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function WorkerEarning() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    completedOrders: 0,
    averagePerOrder: 0,
    thisMonth: 0,
    thisWeek: 0,
    averageRating: 0,
  });
  const [earnings, setEarnings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);

      // Fetch earnings summary and list from new Earning table
      const earningsResponse = await axiosInstance.get('/api/earnings/worker');
      console.log("Earnings data:", earningsResponse.data);

      if (earningsResponse.data.summary) {
        // Map backend field names to frontend field names
        const backendSummary = earningsResponse.data.summary;
        setSummary({
          totalEarnings: backendSummary.totalEarnings || 0,
          completedOrders: backendSummary.completedJobs || 0,
          averagePerOrder: backendSummary.averagePerJob || 0,
          thisMonth: backendSummary.thisMonth || 0,
          thisWeek: backendSummary.thisWeek || 0,
          averageRating: backendSummary.averageRating || 0,
        });
      }

      if (earningsResponse.data.earnings) {
        setEarnings(earningsResponse.data.earnings);
      }

      // Fetch earnings by category
      const categoriesResponse = await axiosInstance.get('/api/earnings/worker/by-category');
      console.log("Category earnings:", categoriesResponse.data);

      if (categoriesResponse.data.categories) {
        setCategories(categoriesResponse.data.categories);
      }

      // Fetch monthly earnings
      const monthlyResponse = await axiosInstance.get('/api/earnings/worker/monthly');
      console.log("Monthly earnings:", monthlyResponse.data);

      if (monthlyResponse.data.monthlyBreakdown) {
        setMonthlyData(monthlyResponse.data.monthlyBreakdown);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error("Failed to load earnings data");
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'LKR 0';
    }
    return `LKR ${Number(amount).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    if (!rating) return <span className="text-muted small">No rating</span>;

    return (
      <div className="d-inline-flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'text-warning' : 'text-muted'}
            size={14}
          />
        ))}
        <span className="ms-1 small text-muted">({rating})</span>
      </div>
    );
  };

  // Calculate percentage for category progress bars
  const getCategoryPercentage = (categoryEarnings) => {
    if (!summary.totalEarnings || summary.totalEarnings === 0 || !categoryEarnings) return 0;
    return ((categoryEarnings / summary.totalEarnings) * 100).toFixed(1);
  };

  return (
    <div className="bg-light">
      <TopNavbar />

      <Container className="my-4 min-vh-100">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">Earnings Overview</h2>
            <p className="text-muted mb-0">Summary of your completed jobs and earnings</p>
          </div>
          <div>
            <Button variant="outline-secondary" onClick={fetchEarningsData} disabled={loading}>
              <FaCalendar className="me-2" />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="info" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3 text-muted">Loading earnings data...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <Row className="g-3 mb-4">
              <Col md={4}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="p-3 bg-success bg-opacity-10 rounded-circle me-3">
                        <FaMoneyBillWave className="text-success" size={24} />
                      </div>
                      <div>
                        <h6 className="mb-0 text-muted small">Total Earnings</h6>
                        <h4 className="fw-bold mb-0">{formatCurrency(summary.totalEarnings)}</h4>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">This month: {formatCurrency(summary.thisMonth)}</small>
                    </div>
                    <div className="mt-2">
                      <small className="text-muted">This week: {formatCurrency(summary.thisWeek)}</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="p-3 bg-info bg-opacity-10 rounded-circle me-3">
                        <FaBriefcase className="text-info" size={24} />
                      </div>
                      <div>
                        <h6 className="mb-0 text-muted small">Completed Orders</h6>
                        <h4 className="fw-bold mb-0">{summary.completedOrders}</h4>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">Total jobs completed</small>
                    </div>
                    <div className="mt-2">
                      <small className="text-success">
                        Avg rating: {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : 'N/A'}
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="p-3 bg-warning bg-opacity-10 rounded-circle me-3">
                        <FaChartLine className="text-warning" size={24} />
                      </div>
                      <div>
                        <h6 className="mb-0 text-muted small">Average Per Order</h6>
                        <h4 className="fw-bold mb-0">{formatCurrency(summary.averagePerOrder)}</h4>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">Based on completed orders</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Top Earning Categories */}
            {categories.length > 0 && (
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">Top Earning Categories</h6>
                    <Badge bg="info">{categories.length} Categories</Badge>
                  </div>

                  {categories.slice(0, 5).map((category, index) => (
                    <div key={index} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">{category.category}</span>
                        <span className="text-muted small">
                          {formatCurrency(category.earnings)} ({category.orders} jobs)
                        </span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className={`progress-bar ${
                            index === 0 ? 'bg-success' :
                            index === 1 ? 'bg-info' :
                            index === 2 ? 'bg-warning' : 'bg-secondary'
                          }`}
                          style={{ width: `${getCategoryPercentage(category.earnings)}%` }}
                        ></div>
                      </div>
                      <div className="text-end">
                        <small className="text-muted">
                          {getCategoryPercentage(category.earnings)}% of total earnings
                        </small>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            )}

            {/* Recent Earnings Table */}
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Recent Earnings</h6>
                  <Badge bg="secondary">{earnings.length} Completed Jobs</Badge>
                </div>

                {earnings.length === 0 ? (
                  <div className="text-center py-5">
                    <FaBriefcase size={60} className="text-muted mb-3" />
                    <h5 className="text-muted">No Completed Jobs Yet</h5>
                    <p className="text-muted">
                      Complete your first job to start seeing earnings here.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Job Title</th>
                          <th>Customer</th>
                          <th>Category</th>
                          <th>Earned Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Rating</th>
                          <th>Payment ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {earnings.map((earning, index) => (
                          <tr key={index}>
                            <td className="fw-semibold">{earning.jobTitle}</td>
                            <td>{earning.customerName}</td>
                            <td>
                              <Badge bg="light" text="dark">{earning.jobCategory}</Badge>
                            </td>
                            <td>{formatDate(earning.earnedDate)}</td>
                            <td className="fw-bold text-success">
                              {formatCurrency(earning.amount)}
                            </td>
                            <td>
                              <Badge bg={earning.status === 'COMPLETED' ? 'success' : 'warning'}>
                                {earning.status}
                              </Badge>
                            </td>
                            <td>{renderStars(earning.rating)}</td>
                            <td>
                              <small className="text-muted">
                                {earning.paymentGatewayId || 'Pending'}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </>
        )}
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
