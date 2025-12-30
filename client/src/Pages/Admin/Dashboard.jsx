import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { Users, Briefcase, CalendarCheck, DollarSign, Search, ArrowUpRight } from "lucide-react";
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const [statistics, setStatistics] = useState({
    activeUsers: 0,
    postedJobs: 0,
    activeBookings: 0,
    totalRevenue: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsResponse, jobsResponse] = await Promise.all([
        axiosInstance.get('/api/admin/dashboard/statistics'),
        axiosInstance.get('/api/admin/dashboard/recent-jobs?limit=10')
      ]);

      if (statsResponse.data.success) {
        setStatistics(statsResponse.data.data);
      }

      if (jobsResponse.data.success) {
        setRecentJobs(jobsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `LKR ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `LKR ${(amount / 1000).toFixed(1)}K`;
    }
    return `LKR ${amount.toLocaleString()}`;
  };

  const getJobStatus = (job) => {
    if (job.orders && job.orders.length > 0) {
      const latestOrder = job.orders[0];
      if (latestOrder.status === 'ACCEPTED') return 'Active';
      if (latestOrder.status === 'COMPLETED') return 'Completed';
      if (latestOrder.status === 'CANCELLED') return 'Cancelled';
      if (latestOrder.status === 'PENDING') return 'Pending';
    }
    return job.status;
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Open': return 'success';
      case 'Active': return 'primary';
      case 'Completed': return 'secondary';
      case 'Cancelled': return 'danger';
      case 'Pending': return 'warning';
      default: return 'secondary';
    }
  };

  const filteredJobs = recentJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.category?.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsCards = [
    {
      title: "Active Users",
      value: statistics.activeUsers.toString(),
      note: "Registered workers & customers",
      icon: <Users />,
      color: "primary"
    },
    {
      title: "Jobs Posted",
      value: statistics.postedJobs.toString(),
      note: "New & ongoing jobs",
      icon: <Briefcase />,
      color: "success"
    },
    {
      title: "Active Bookings",
      value: statistics.activeBookings.toString(),
      note: "Currently assigned",
      icon: <CalendarCheck />,
      color: "warning"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(statistics.totalRevenue),
      note: "Overall earnings",
      icon: <DollarSign />,
      color: "info"
    }
  ];

  return (
    <div>
      <TopNavbar />

      <Container fluid className="bg-light min-vh-100 p-4">
        {/* Header */}
        <Row className="mb-4 align-items-center">
          <Col>
            <h4 className="fw-bold mb-1">Dashboard</h4>
            <p className="text-muted mb-0">Wage Worker Management System</p>
          </Col>
        </Row>

        {/* Stat Cards */}
        <Row className="g-4 mb-4">
          {loading ? (
            <Col className="text-center p-5">
              <Spinner animation="border" variant="primary" />
            </Col>
          ) : (
            statsCards.map((card, i) => (
              <Col md={3} key={i}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className={`p-3 rounded-circle bg-${card.color} bg-opacity-10 text-${card.color}`}>
                        {card.icon}
                      </div>
                      <ArrowUpRight className="text-muted" size={18} />
                    </div>
                    <h3 className="fw-bold mb-0">{card.value}</h3>
                    <p className="text-muted mb-1">{card.title}</p>
                    <small className="text-muted">{card.note}</small>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>

        {/* Main Content */}
        <Row className="g-4">
          {/* Recent Job Requests */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Recent Job Requests</h6>
                  <InputGroup style={{ maxWidth: 260 }}>
                    <InputGroup.Text className="bg-white border-end-0">
                      <Search size={16} />
                    </InputGroup.Text>
                    <Form.Control
                      className="border-start-0"
                      placeholder="Search job, role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </div>

                <div className="table-responsive">
                  {loading ? (
                    <div className="text-center p-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-3 text-muted">Loading jobs...</p>
                    </div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="text-center p-5">
                      <p className="text-muted">No recent job requests found</p>
                    </div>
                  ) : (
                    <Table hover borderless className="align-middle">
                      <thead className="text-muted small">
                        <tr>
                          <th>Job</th>
                          <th>Category</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobs.map((job) => {
                          const jobStatus = getJobStatus(job);
                          return (
                            <tr key={job.id} className="rounded-3">
                              <td>
                                <div className="fw-semibold">{job.title}</div>
                                <small className="text-muted">
                                  {job.description?.substring(0, 30)}{job.description?.length > 30 ? '...' : ''}
                                </small>
                              </td>
                              <td>
                                <Badge bg="light" text="dark" className="px-3 py-1 rounded-pill">
                                  {job.category?.category || 'N/A'}
                                </Badge>
                              </td>
                              <td className="text-muted">{job.location || 'N/A'}</td>
                              <td>
                                <Badge bg={getStatusVariant(jobStatus)} className="px-3 py-1 rounded-pill">
                                  {jobStatus}
                                </Badge>
                              </td>
                              <td className="fw-semibold">LKR {job.rate}/hr</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Panel */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 mb-4">
              <Card.Body>
                <h6 className="fw-bold mb-3">Admin Activity</h6>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">🧑‍🔧</div>
                  <div><strong>{statistics.activeUsers}</strong> registered users</div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">📌</div>
                  <div><strong>{statistics.postedJobs}</strong> jobs posted</div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-3">💰</div>
                  <div><strong>{formatCurrency(statistics.totalRevenue)}</strong> total revenue</div>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm rounded-4 bg-primary bg-gradient text-white">
              <Card.Body>
                <h6 className="fw-bold">Active Bookings</h6>
                <p className="small opacity-75 mb-3">
                  Currently {statistics.activeBookings} jobs are in progress
                </p>
                <Button variant="light" size="sm" className="rounded-pill">
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
}
