import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { Users, Briefcase, CalendarCheck, DollarSign, Search, ArrowUpRight } from "lucide-react";
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const [statistics, setStatistics] = useState({
    pendingOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    pendingJobs: 0,
    pendingReviews: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsResponse, ordersResponse] = await Promise.all([
        axiosInstance.get('/api/reviewer/dashboard/statistics'),
        axiosInstance.get('/api/reviewer/orders?limit=10')
      ]);

      if (statsResponse.data.success) {
        setStatistics(statsResponse.data.data);
      }

      if (ordersResponse.data.success) {
        setRecentOrders(ordersResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'ACCEPTED': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  };

  const filteredOrders = recentOrders.filter(order =>
    order.job?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.job?.category?.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsCards = [
    {
      title: "Pending Orders",
      value: statistics.pendingOrders.toString(),
      note: "Awaiting acceptance",
      icon: <CalendarCheck />,
      color: "warning"
    },
    {
      title: "Active Orders",
      value: statistics.activeOrders.toString(),
      note: "Currently in progress",
      icon: <Briefcase />,
      color: "primary"
    },
    {
      title: "Completed Orders",
      value: statistics.completedOrders.toString(),
      note: "Successfully finished",
      icon: <Users />,
      color: "success"
    },
    {
      title: "Pending Jobs",
      value: statistics.pendingJobs.toString(),
      note: "Awaiting approval",
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
          {/* ================== UPDATED SECTION ONLY ================== */}
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
                      <p className="mt-3 text-muted">Loading orders...</p>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center p-5">
                      <p className="text-muted">No recent orders found</p>
                    </div>
                  ) : (
                    <Table hover borderless className="align-middle">
                      <thead className="text-muted small">
                        <tr>
                          <th>Job</th>
                          <th>Category</th>
                          <th>Worker</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="rounded-3">
                            <td>
                              <div className="fw-semibold">{order.job?.title || 'N/A'}</div>
                              <small className="text-muted">
                                {order.job?.description?.substring(0, 30)}
                                {order.job?.description?.length > 30 ? '...' : ''}
                              </small>
                            </td>
                            <td>
                              <Badge bg="light" text="dark" className="px-3 py-1 rounded-pill">
                                {order.job?.category?.category || 'N/A'}
                              </Badge>
                            </td>
                            <td className="text-muted">
                              {order.jobApplication?.user ?
                                `${order.jobApplication.user.fname} ${order.jobApplication.user.lname}` :
                                'N/A'}
                            </td>
                            <td>
                              <Badge bg={getStatusVariant(order.status)} className="px-3 py-1 rounded-pill">
                                {order.status}
                              </Badge>
                            </td>
                            <td className="fw-semibold">
                              {new Date(order.acceptedDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
          {/* ================== END UPDATED SECTION ================== */}

          {/* Right Panel */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 mb-4">
              <Card.Body>
                <h6 className="fw-bold mb-3">Reviewer Activity</h6>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">📋</div>
                  <div><strong>{statistics.pendingJobs}</strong> jobs pending approval</div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">⭐</div>
                  <div><strong>{statistics.pendingReviews}</strong> reviews pending approval</div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-3">✅</div>
                  <div><strong>{statistics.completedOrders}</strong> completed orders</div>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm rounded-4 bg-primary bg-gradient text-white">
              <Card.Body>
                <h6 className="fw-bold">Approval Queue</h6>
                <p className="small opacity-75 mb-3">
                  Currently {statistics.pendingJobs} jobs and {statistics.pendingReviews} reviews awaiting review
                </p>
                <Button variant="light" size="sm" className="rounded-pill" href="/reviewer/jobs">
                  Review Now
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
