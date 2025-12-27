import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Row, Col, Modal } from 'react-bootstrap';
import { FaMapMarkerAlt, FaRegCalendarAlt, FaBriefcase, FaPlay, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import { toast } from 'react-toastify';
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';
import axiosInstance from '../../api/axios';

export default function WorkerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWorkerOrders();
  }, []);

  const fetchWorkerOrders = async () => {
    try {
      const response = await axiosInstance.get('/api/orders/worker');
      console.log("Worker Orders:", response.data);
      setOrders(response.data.orders || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
      setLoading(false);
    }
  };

  const handleShowStartModal = (order) => {
    setSelectedOrder(order);
    setShowStartModal(true);
  };

  const handleCloseStartModal = () => {
    setShowStartModal(false);
    setSelectedOrder(null);
  };

  const handleStartOrder = async () => {
    if (!selectedOrder) return;

    setActionLoading(true);
    try {
      const response = await axiosInstance.patch(`/api/orders/${selectedOrder.id}/start`);
      console.log("Order started:", response.data);

      toast.success("Order started successfully!");
      handleCloseStartModal();

      // Refresh orders list
      fetchWorkerOrders();
    } catch (error) {
      console.error("Error starting order:", error);
      toast.error(error.response?.data?.message || "Failed to start order");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      case 'ACCEPTED':
        return 'info';
      case 'PENDING':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'COMPLETED':
        return <FaCheckCircle className="me-1" />;
      case 'ACCEPTED':
        return <FaPlay className="me-1" />;
      case 'PENDING':
        return <FaHourglassHalf className="me-1" />;
      default:
        return null;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysAgo = (date) => {
    if (!date) return 'N/A';
    const diff = new Date() - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const canStartOrder = (order) => {
    // Can start if order is ACCEPTED and hasn't been started yet
    return order.status === 'ACCEPTED' && !order.startedDate;
  };

  return (
    <div>
      <div className="min-vh-100 d-flex flex-column bg-light">
        <TopNavbar />

        <Container className="my-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">My Orders</h2>
            <Button variant="outline-info" onClick={fetchWorkerOrders} disabled={loading}>
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <Card className="border-0 shadow-sm text-center py-5">
              <Card.Body>
                <FaBriefcase size={60} className="text-muted mb-3" />
                <h4>No Orders Yet</h4>
                <p className="text-muted">
                  You don't have any orders yet. Orders are created when a customer accepts your job application.
                </p>
                <Button variant="info" className="text-white mt-3" href="/workerjob">
                  Browse Jobs
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <div>
              {/* Summary Cards */}
              <Row className="mb-4">
                <Col md={4}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                          <FaHourglassHalf size={24} className="text-warning" />
                        </div>
                        <div>
                          <div className="text-muted small">Pending Customer Acceptance</div>
                          <h4 className="mb-0">{orders.filter(o => o.status === 'PENDING').length}</h4>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                          <FaPlay size={24} className="text-info" />
                        </div>
                        <div>
                          <div className="text-muted small">Accepted / In Progress</div>
                          <h4 className="mb-0">{orders.filter(o => o.status === 'ACCEPTED').length}</h4>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                          <FaCheckCircle size={24} className="text-success" />
                        </div>
                        <div>
                          <div className="text-muted small">Completed</div>
                          <h4 className="mb-0">{orders.filter(o => o.status === 'COMPLETED').length}</h4>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Orders List */}
              {orders.map((order) => {
                const job = order.job || {};
                const customer = job.createdUser || {};

                return (
                  <Card key={order.id} className="mb-4 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <Row>
                        <Col md={9}>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <h5 className="mb-0 fw-bold">{job.title || 'N/A'}</h5>
                            <Badge bg={getStatusColor(order.status)} className="rounded-pill d-flex align-items-center">
                              {getStatusIcon(order.status)}
                              {order.status?.replace('_', ' ') || 'PENDING'}
                            </Badge>
                          </div>

                          <p className="text-muted mb-2">
                            <strong>Customer:</strong> {customer.fname} {customer.lname}
                          </p>

                          <p className="text-muted mb-3">
                            {job.description || 'No description available'}
                          </p>

                          <div className="d-flex flex-wrap gap-3 text-secondary small mb-3">
                            <span className="d-flex align-items-center">
                              <FaMapMarkerAlt size={14} className="me-1" />
                              {job.location || 'N/A'}
                            </span>
                            <span className="d-flex align-items-center">
                              <FaBriefcase size={14} className="me-1" />
                              {job.category?.category || 'N/A'}
                            </span>
                            <span className="d-flex align-items-center">
                              <FaRegCalendarAlt size={14} className="me-1" />
                              Accepted {getDaysAgo(order.acceptedDate)}
                            </span>
                          </div>

                          {order.startedDate && (
                            <div className="small text-success mb-2">
                              <strong>Started:</strong> {formatDate(order.startedDate)}
                            </div>
                          )}

                          {order.completedDate && (
                            <div className="small text-success mb-2">
                              <strong>Completed:</strong> {formatDate(order.completedDate)}
                            </div>
                          )}

                          {job.skills && (
                            <div className="d-flex flex-wrap gap-2">
                              {job.skills.split(',').slice(0, 4).map((skill, idx) => (
                                <Badge key={idx} bg="light" text="dark" className="px-2 py-1">
                                  {skill.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </Col>

                        <Col md={3} className="d-flex flex-column justify-content-center align-items-end gap-2">
                          <div className="text-end mb-2">
                            <div className="small text-muted">Hourly Rate</div>
                            <h5 className="mb-0 text-info">LKR {job.hourlyRate || 0}</h5>
                          </div>

                          {order.status === 'PENDING' && (
                            <Badge bg="warning" className="px-3 py-2">
                              Waiting Customer Accept
                            </Badge>
                          )}

                          {canStartOrder(order) && (
                            <Button
                              variant="success"
                              size="sm"
                              className="d-flex align-items-center gap-1"
                              onClick={() => handleShowStartModal(order)}
                            >
                              <FaPlay size={12} />
                              Start Work
                            </Button>
                          )}

                          {order.status === 'ACCEPTED' && order.startedDate && (
                            <Badge bg="info" className="px-3 py-2">
                              Work in Progress
                            </Badge>
                          )}

                          {order.status === 'COMPLETED' && (
                            <Badge bg="success" className="px-3 py-2">
                              Completed
                            </Badge>
                          )}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}
        </Container>
      </div>
      <Footer />

      {/* Start Order Confirmation Modal */}
      <Modal show={showStartModal} onHide={handleCloseStartModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Start Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to start working on this order?</p>
          {selectedOrder && (
            <div className="bg-light p-3 rounded">
              <h6 className="fw-bold">{selectedOrder.job?.title}</h6>
              <p className="text-muted mb-0 small">
                Customer: {selectedOrder.job?.createdUser?.fname} {selectedOrder.job?.createdUser?.lname}
              </p>
              <p className="text-muted mb-0 small">
                Hourly Rate: LKR {selectedOrder.job?.hourlyRate}
              </p>
            </div>
          )}
          <p className="text-muted small mt-3">
            Once you start, the order status will change to "In Progress" and the customer will be notified.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseStartModal} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleStartOrder}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Starting...
              </>
            ) : (
              <>
                <FaPlay className="me-2" />
                Start Order
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
