import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Row, Col, Modal, Form } from 'react-bootstrap';
import { FaStar, FaReply, FaCheckCircle, FaUserCircle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';
import axiosInstance from '../../api/axios';
import 'react-toastify/dist/ReactToastify.css';

export default function WorkerReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reply, setReply] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchWorkerReviews();
  }, []);

  const fetchWorkerReviews = async () => {
    try {
      const response = await axiosInstance.get('/api/reviews/worker');
      console.log("Worker Reviews:", response.data);
      setReviews(response.data.reviews || []);
      setStats(response.data.stats || { averageRating: 0, totalReviews: 0 });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
      setLoading(false);
    }
  };

  const handleShowReplyModal = (review) => {
    setSelectedReview(review);
    setReply(review.workerReply || '');
    setShowReplyModal(true);
  };

  const handleCloseReplyModal = () => {
    setShowReplyModal(false);
    setSelectedReview(null);
    setReply('');
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();

    if (!reply.trim()) {
      toast.error('Please provide a reply');
      return;
    }

    setSubmittingReply(true);
    try {
      await axiosInstance.patch(`/api/reviews/${selectedReview.id}/reply`, {
        reply: reply.trim()
      });

      toast.success('Reply submitted successfully!');
      handleCloseReplyModal();
      fetchWorkerReviews(); // Refresh to show the reply
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error(error.response?.data?.message || 'Failed to submit reply');
    } finally {
      setSubmittingReply(false);
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

  const renderStars = (rating) => {
    return (
      <div className="d-inline-flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'text-warning' : 'text-muted'}
            size={18}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="min-vh-100 d-flex flex-column bg-light">
        <TopNavbar />

        <Container className="my-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">My Reviews</h2>
            <Button variant="outline-info" onClick={fetchWorkerReviews} disabled={loading}>
              Refresh
            </Button>
          </div>

          {/* Statistics Card */}
          {stats.totalReviews > 0 && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <Row>
                  <Col md={6} className="text-center border-end">
                    <div className="small text-muted mb-2">Average Rating</div>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <h2 className="mb-0 fw-bold text-warning">
                        {stats.averageRating.toFixed(1)}
                      </h2>
                      <div className="d-flex flex-column">
                        {renderStars(Math.round(stats.averageRating))}
                        <span className="small text-muted">out of 5</span>
                      </div>
                    </div>
                  </Col>
                  <Col md={6} className="text-center">
                    <div className="small text-muted mb-2">Total Reviews</div>
                    <h2 className="mb-0 fw-bold text-info">{stats.totalReviews}</h2>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading your reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <Card className="border-0 shadow-sm text-center py-5">
              <Card.Body>
                <FaStar size={60} className="text-muted mb-3" />
                <h4>No Reviews Yet</h4>
                <p className="text-muted">
                  You haven't received any reviews yet. Complete orders to receive feedback from customers!
                </p>
                <Button variant="info" className="text-white mt-3" href="/workerorders">
                  View My Orders
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <div>
              {reviews.map((review) => {
                const order = review.order || {};
                const job = order.job || {};
                const customer = review.reviewer || {};

                return (
                  <Card key={review.id} className="mb-4 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <Row>
                        <Col md={9}>
                          {/* Job and Rating */}
                          <div className="d-flex align-items-center gap-3 mb-3">
                            <h5 className="mb-0 fw-bold">{job.title || 'N/A'}</h5>
                            <div className="d-flex align-items-center gap-2">
                              {renderStars(review.rating)}
                              <Badge bg="warning" text="dark" className="rounded-pill">
                                {review.rating}/5
                              </Badge>
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <FaUserCircle size={20} className="text-info" />
                            <span className="fw-semibold">
                              {customer.fname} {customer.lname}
                            </span>
                            <span className="text-muted small">
                              • Reviewed on {formatDate(review.createdAt)}
                            </span>
                          </div>

                          {/* Review Comment */}
                          <div className="mb-3 p-3 bg-light rounded">
                            <p className="mb-0">{review.comment}</p>
                          </div>

                          {/* Worker Reply */}
                          {review.workerReply && (
                            <div className="ms-4 p-3 bg-info bg-opacity-10 rounded border-start border-info border-3">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <FaReply className="text-info" />
                                <span className="fw-semibold small">Your Reply</span>
                                {review.repliedAt && (
                                  <span className="text-muted small">
                                    • {formatDate(review.repliedAt)}
                                  </span>
                                )}
                              </div>
                              <p className="mb-0 small">{review.workerReply}</p>
                            </div>
                          )}
                        </Col>

                        <Col md={3} className="d-flex flex-column justify-content-center align-items-end gap-2">
                          {review.workerReply ? (
                            <Badge bg="success" className="px-3 py-2">
                              <FaCheckCircle className="me-1" />
                              Replied
                            </Badge>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              className="d-flex align-items-center gap-1"
                              onClick={() => handleShowReplyModal(review)}
                            >
                              <FaReply size={12} />
                              Reply
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
        </Container>
      </div>
      <Footer />

      {/* Reply Modal */}
      <Modal show={showReplyModal} onHide={handleCloseReplyModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reply to Review</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitReply}>
          <Modal.Body>
            {selectedReview && (
              <>
                {/* Original Review Display */}
                <div className="mb-4 p-3 bg-light rounded">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <strong>Customer's Review:</strong>
                    {renderStars(selectedReview.rating)}
                  </div>
                  <p className="mb-0 small text-muted">{selectedReview.comment}</p>
                </div>

                <Form.Group>
                  <Form.Label className="fw-semibold">Your Reply *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Thank the customer and respond to their feedback..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    maxLength={1000}
                    required
                  />
                  <Form.Text className="text-muted">
                    {reply.length}/1000 characters
                  </Form.Text>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseReplyModal}
              disabled={submittingReply}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={submittingReply || !reply.trim()}
            >
              {submittingReply ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending...
                </>
              ) : (
                <>
                  <FaReply className="me-2" />
                  Send Reply
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
