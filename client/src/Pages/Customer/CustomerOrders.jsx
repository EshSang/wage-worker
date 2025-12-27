import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Row, Col, Modal, Form, Tabs, Tab } from 'react-bootstrap';
import { FaUser, FaRegCalendarAlt, FaBriefcase, FaEnvelope, FaPhone, FaStar, FaCheckCircle, FaClipboardList, FaPlayCircle } from 'react-icons/fa';
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';
import axiosInstance from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CustomerOrders() {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [inProgressOrders, setInProgressOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchApplicationsForMyJobs();
    fetchInProgressOrders();
    fetchCompletedOrders();
  }, []);

  const fetchApplicationsForMyJobs = async () => {
    try {
      const response = await axiosInstance.get('/api/applications/my-jobs');
      console.log("Applications for my jobs:", response.data);
      setApplications(response.data.applications || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setLoading(false);
    }
  };

  const fetchInProgressOrders = async () => {
    try {
      const response = await axiosInstance.get('/api/orders/customer');
      console.log("Customer Orders:", response.data);
      const inProgress = response.data.orders?.filter(order => order.status === 'ACCEPTED') || [];
      setInProgressOrders(inProgress);
    } catch (error) {
      console.error("Error fetching in-progress orders:", error);
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      const response = await axiosInstance.get('/api/orders/customer');
      console.log("Customer Orders:", response.data);
      const completed = response.data.orders?.filter(order => order.status === 'COMPLETED') || [];
      setCompletedOrders(completed);
    } catch (error) {
      console.error("Error fetching completed orders:", error);
    }
  };

  const handleShowReviewModal = (order) => {
    setSelectedOrder(order);
    setRating(0);
    setHoverRating(0);
    setComment('');
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedOrder(null);
    setRating(0);
    setHoverRating(0);
    setComment('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    setSubmittingReview(true);
    try {
      await axiosInstance.post('/api/reviews', {
        orderId: selectedOrder.id,
        rating,
        comment: comment.trim()
      });

      toast.success('Review submitted successfully!');
      handleCloseReviewModal();
      fetchCompletedOrders(); // Refresh to update review status
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await axiosInstance.patch(`/api/applications/${applicationId}/status`, {
        status: newStatus
      });
      toast.success(`Application ${newStatus.toLowerCase()} successfully!`);
      // Refresh the list
      fetchApplicationsForMyJobs();
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Failed to update application status");
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'APPROVED':
      case 'IN_PROGRESS':
      case 'COMPLETED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'APPLIED':
      case 'PENDING':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getDaysAgo = (date) => {
    const diff = new Date() - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div>
      <div className="min-vh-100 d-flex flex-column bg-light">
        <TopNavbar />

        <Container className="my-4">
          <h2 className="fw-bold mb-4">My Orders</h2>
          <p className="text-muted mb-4">Manage job applications and completed orders</p>

          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100 bg-warning bg-opacity-10">
                <Card.Body className="text-center">
                  <FaClipboardList size={40} className="text-warning mb-2" />
                  <h3 className="fw-bold mb-0">{applications.filter(app => app.applicationStatus === 'APPLIED' || app.applicationStatus === 'PENDING').length}</h3>
                  <p className="text-muted small mb-0">Pending Customer Acceptance</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100 bg-info bg-opacity-10">
                <Card.Body className="text-center">
                  <FaPlayCircle size={40} className="text-info mb-2" />
                  <h3 className="fw-bold mb-0">{inProgressOrders.length}</h3>
                  <p className="text-muted small mb-0">Accepted / In Progress</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100 bg-success bg-opacity-10">
                <Card.Body className="text-center">
                  <FaCheckCircle size={40} className="text-success mb-2" />
                  <h3 className="fw-bold mb-0">{completedOrders.length}</h3>
                  <p className="text-muted small mb-0">Completed</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            {/* Job Applications Tab */}
            <Tab
              eventKey="applications"
              title={
                <span>
                  <FaClipboardList className="me-2" />
                  Job Applications
                  {applications.length > 0 && (
                    <Badge bg="info" className="ms-2">{applications.length}</Badge>
                  )}
                </span>
              }
            >
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-info" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <Card className="border-0 shadow-sm text-center py-5">
                  <Card.Body>
                    <FaBriefcase size={60} className="text-muted mb-3" />
                    <h4>No Applications Yet</h4>
                    <p className="text-muted">
                      No one has applied to your jobs yet. Keep posting great opportunities!
                    </p>
                    <Button variant="info" className="text-white mt-3" href="/customerjobpost">
                      Post a Job
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                <div>
              {applications.map((application) => {
                const job = application.job || {};
                const user = application.user || {};
                return (
                  <Card key={application.id} className="mb-4 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <Row>
                        <Col md={8}>
                          {/* Job Title and Status */}
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <h5 className="mb-0 fw-bold text-primary">
                              <FaBriefcase className="me-2" />
                              {job.title || 'N/A'}
                            </h5>
                            <Badge bg={getStatusColor(application.applicationStatus)} className="rounded-pill">
                              {application.applicationStatus || 'Pending'}
                            </Badge>
                          </div>

                          {/* Applicant Information */}
                          <div className="mb-3 p-3 bg-light rounded">
                            <h6 className="fw-bold mb-2">
                              <FaUser className="me-2" />
                              Applicant Information
                            </h6>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="small text-muted">Name</div>
                                <div className="fw-semibold">
                                  {user.fname} {user.lname}
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="small text-muted">
                                  <FaEnvelope className="me-1" />
                                  Email
                                </div>
                                <div className="fw-semibold">{user.email}</div>
                              </div>
                              <div className="col-md-6 mt-2">
                                <div className="small text-muted">
                                  <FaPhone className="me-1" />
                                  Phone
                                </div>
                                <div className="fw-semibold">{user.phonenumber || 'N/A'}</div>
                              </div>
                              <div className="col-md-6 mt-2">
                                <div className="small text-muted">
                                  <FaRegCalendarAlt className="me-1" />
                                  Applied
                                </div>
                                <div className="fw-semibold">{getDaysAgo(application.appliedDate)}</div>
                              </div>
                            </div>

                            {/* Skills */}
                            {user.skills && (
                              <div className="mt-3">
                                <div className="small text-muted mb-2">Skills</div>
                                <div className="d-flex flex-wrap gap-1">
                                  {user.skills.split(',').map((skill, idx) => (
                                    <Badge key={idx} bg="secondary" className="px-2 py-1">
                                      {skill.trim()}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* About */}
                            {user.about && (
                              <div className="mt-2">
                                <div className="small text-muted">About</div>
                                <p className="mb-0 small">{user.about}</p>
                              </div>
                            )}
                          </div>

                          {/* Job Details */}
                          <div className="d-flex flex-wrap gap-3 text-secondary small">
                            <span>
                              <strong>Location:</strong> {job.location || 'N/A'}
                            </span>
                            <span>
                              <strong>Hourly Rate:</strong> LKR {job.hourlyRate || 0}
                            </span>
                            <span>
                              <strong>Category:</strong> {job.category?.category || 'N/A'}
                            </span>
                          </div>
                        </Col>

                        {/* Action Buttons */}
                        <Col md={4} className="d-flex flex-column justify-content-center align-items-end gap-2">
                          {(application.applicationStatus === 'APPLIED' || application.applicationStatus === 'PENDING') && (
                            <>
                              <Button
                                variant="success"
                                className="w-100"
                                onClick={() => handleUpdateStatus(application.id, 'APPROVED')}
                              >
                                Approve Application
                              </Button>
                              <Button
                                variant="danger"
                                className="w-100"
                                onClick={() => handleUpdateStatus(application.id, 'REJECTED')}
                              >
                                Reject Application
                              </Button>
                            </>
                          )}
                          {application.applicationStatus !== 'APPLIED' && application.applicationStatus !== 'PENDING' && (
                            <div className="text-center p-3 bg-light rounded w-100">
                              <div className="small text-muted">Application Status</div>
                              <h5 className={`mb-0 text-${getStatusColor(application.applicationStatus)}`}>
                                {application.applicationStatus}
                              </h5>
                            </div>
                          )}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                );
              })}
                </div>
              )}
            </Tab>

            {/* In Progress Orders Tab */}
            <Tab
              eventKey="inprogress"
              title={
                <span>
                  <FaPlayCircle className="me-2" />
                  Accepted / In Progress
                  {inProgressOrders.length > 0 && (
                    <Badge bg="info" className="ms-2">{inProgressOrders.length}</Badge>
                  )}
                </span>
              }
            >
              {inProgressOrders.length === 0 ? (
                <Card className="border-0 shadow-sm text-center py-5">
                  <Card.Body>
                    <FaPlayCircle size={60} className="text-muted mb-3" />
                    <h4>No In Progress Orders</h4>
                    <p className="text-muted">
                      No workers have started working on your jobs yet.
                    </p>
                  </Card.Body>
                </Card>
              ) : (
                <div>
                  {inProgressOrders.map((order) => {
                const job = order.job || {};
                const worker = order.user || {};
                return (
                  <Card key={order.id} className="mb-4 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <Row>
                        <Col md={8}>
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <h5 className="mb-0 fw-bold text-info">
                              <FaBriefcase className="me-2" />
                              {job.title || 'N/A'}
                            </h5>
                            <Badge bg={order.startedDate ? 'primary' : 'info'} className="rounded-pill">
                              {order.startedDate ? 'In Progress' : 'Accepted'}
                            </Badge>
                          </div>

                          {/* Worker Information */}
                          <div className="mb-3 p-3 bg-light rounded">
                            <h6 className="fw-bold mb-2">
                              <FaUser className="me-2" />
                              Worker Information
                            </h6>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="small text-muted">Name</div>
                                <div className="fw-semibold">
                                  {worker.fname} {worker.lname}
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="small text-muted">
                                  <FaEnvelope className="me-1" />
                                  Email
                                </div>
                                <div className="fw-semibold">{worker.email}</div>
                              </div>
                              <div className="col-md-6 mt-2">
                                <div className="small text-muted">
                                  <FaPhone className="me-1" />
                                  Phone
                                </div>
                                <div className="fw-semibold">{worker.phonenumber || 'N/A'}</div>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex flex-wrap gap-3 text-secondary small">
                            <span>
                              <strong>Accepted:</strong>{' '}
                              {order.acceptedDate
                                ? new Date(order.acceptedDate).toLocaleDateString()
                                : 'N/A'}
                            </span>
                            {order.startedDate && (
                              <span>
                                <strong>Started:</strong>{' '}
                                {new Date(order.startedDate).toLocaleDateString()}
                              </span>
                            )}
                            <span>
                              <strong>Hourly Rate:</strong> LKR {job.hourlyRate || 0}
                            </span>
                            <span>
                              <strong>Location:</strong> {job.location || 'N/A'}
                            </span>
                          </div>
                        </Col>

                        <Col md={4} className="d-flex flex-column justify-content-center align-items-end gap-2">
                          <div className="text-center p-3 bg-info bg-opacity-10 rounded w-100">
                            <div className="small text-muted mb-2">Order Status</div>
                            <h5 className="mb-0 text-info">
                              {order.startedDate ? 'Work in Progress' : 'Waiting to Start'}
                            </h5>
                            {order.startedDate && (
                              <p className="small text-muted mt-2 mb-0">
                                Worker is currently working on this job
                              </p>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                );
                  })}
                </div>
              )}
            </Tab>

            {/* Completed Orders Tab */}
            <Tab
              eventKey="completed"
              title={
                <span>
                  <FaCheckCircle className="me-2" />
                  Completed Orders
                  {completedOrders.length > 0 && (
                    <Badge bg="success" className="ms-2">{completedOrders.length}</Badge>
                  )}
                </span>
              }
            >
              {completedOrders.length === 0 ? (
                <Card className="border-0 shadow-sm text-center py-5">
                  <Card.Body>
                    <FaCheckCircle size={60} className="text-muted mb-3" />
                    <h4>No Completed Orders</h4>
                    <p className="text-muted">
                      You don't have any completed orders yet.
                    </p>
                  </Card.Body>
                </Card>
              ) : (
                <div>
                  {completedOrders.map((order) => {
                const job = order.job || {};
                const worker = order.user || {};
                return (
                  <Card key={order.id} className="mb-4 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <Row>
                        <Col md={8}>
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <h5 className="mb-0 fw-bold text-success">
                              <FaBriefcase className="me-2" />
                              {job.title || 'N/A'}
                            </h5>
                            <Badge bg="success" className="rounded-pill">
                              Completed
                            </Badge>
                          </div>

                          {/* Worker Information */}
                          <div className="mb-3 p-3 bg-light rounded">
                            <h6 className="fw-bold mb-2">
                              <FaUser className="me-2" />
                              Worker Information
                            </h6>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="small text-muted">Name</div>
                                <div className="fw-semibold">
                                  {worker.fname} {worker.lname}
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="small text-muted">
                                  <FaEnvelope className="me-1" />
                                  Email
                                </div>
                                <div className="fw-semibold">{worker.email}</div>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex flex-wrap gap-3 text-secondary small">
                            <span>
                              <strong>Completed:</strong>{' '}
                              {order.completedDate
                                ? new Date(order.completedDate).toLocaleDateString()
                                : 'N/A'}
                            </span>
                            <span>
                              <strong>Hourly Rate:</strong> LKR {job.hourlyRate || 0}
                            </span>
                          </div>
                        </Col>

                        <Col md={4} className="d-flex flex-column justify-content-center align-items-end gap-2">
                          {order.reviews && order.reviews.length > 0 ? (
                            <div className="text-center p-3 bg-success bg-opacity-10 rounded w-100">
                              <div className="small text-muted mb-2">Your Review</div>
                              <div className="mb-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <FaStar
                                    key={star}
                                    className={star <= order.reviews[0].rating ? 'text-warning' : 'text-muted'}
                                  />
                                ))}
                              </div>
                              <p className="small mb-0">{order.reviews[0].comment}</p>
                            </div>
                          ) : (
                            <Button
                              variant="warning"
                              className="w-100"
                              onClick={() => handleShowReviewModal(order)}
                            >
                              <FaStar className="me-2" />
                              Leave Review
                            </Button>
                          )}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                );
                  })}
                </div>
              )}
            </Tab>
          </Tabs>
        </Container>
      </div>
      <Footer />

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={handleCloseReviewModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Leave a Review</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitReview}>
          <Modal.Body>
            {selectedOrder && (
              <>
                <div className="mb-4">
                  <h6 className="fw-bold">{selectedOrder.job?.title}</h6>
                  <p className="text-muted small mb-0">
                    Worker: {selectedOrder.user?.fname} {selectedOrder.user?.lname}
                  </p>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Rating *</Form.Label>
                  <div className="d-flex gap-2 fs-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        style={{ cursor: 'pointer' }}
                        className={
                          star <= (hoverRating || rating)
                            ? 'text-warning'
                            : 'text-muted'
                        }
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      />
                    ))}
                  </div>
                  {rating > 0 && (
                    <div className="small text-muted mt-1">
                      {rating} star{rating > 1 ? 's' : ''}
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Comment *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Share your experience with this worker..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={1000}
                    required
                  />
                  <Form.Text className="text-muted">
                    {comment.length}/1000 characters
                  </Form.Text>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseReviewModal}
              disabled={submittingReview}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={submittingReview || rating === 0}
            >
              {submittingReview ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <FaStar className="me-2" />
                  Submit Review
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

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
