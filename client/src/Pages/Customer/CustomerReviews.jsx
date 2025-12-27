import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { FaStar, FaReply, FaUserCircle, FaBriefcase } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';
import axiosInstance from '../../api/axios';
import 'react-toastify/dist/ReactToastify.css';

export default function CustomerReviews() {
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      const response = await axiosInstance.get('/api/orders/customer');
      console.log("Fetching reviews from orders:", response.data);

      // Filter orders that have reviews
      const ordersWithReviews = response.data.orders?.filter(
        order => order.reviews && order.reviews.length > 0
      ) || [];

      // Extract reviews with order and worker info
      const reviews = ordersWithReviews.map(order => ({
        ...order.reviews[0],
        order: order,
        worker: order.user
      }));

      setMyReviews(reviews);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
      setLoading(false);
    }
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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="min-vh-100 d-flex flex-column bg-light">
        <TopNavbar />

        <Container className="my-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1">My Reviews</h2>
              <p className="text-muted mb-0">View all your reviews and worker responses</p>
            </div>
            <Button variant="outline-info" onClick={fetchMyReviews} disabled={loading}>
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading your reviews...</p>
            </div>
          ) : myReviews.length === 0 ? (
            <Card className="border-0 shadow-sm text-center py-5">
              <Card.Body>
                <FaStar size={60} className="text-muted mb-3" />
                <h4>No Reviews Yet</h4>
                <p className="text-muted">
                  You haven't reviewed any completed orders yet.
                </p>
                <Button variant="info" className="text-white mt-3" href="/customerorders">
                  View Orders
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <div>
              {/* Summary Card */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <Row>
                    <Col md={4} className="text-center border-end">
                      <div className="small text-muted mb-2">Total Reviews</div>
                      <h2 className="mb-0 fw-bold text-info">{myReviews.length}</h2>
                    </Col>
                    <Col md={4} className="text-center border-end">
                      <div className="small text-muted mb-2">With Worker Reply</div>
                      <h2 className="mb-0 fw-bold text-success">
                        {myReviews.filter(r => r.workerReply).length}
                      </h2>
                    </Col>
                    <Col md={4} className="text-center">
                      <div className="small text-muted mb-2">Average Rating</div>
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <h2 className="mb-0 fw-bold text-warning">
                          {(myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)}
                        </h2>
                        <FaStar className="text-warning" size={24} />
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Reviews List */}
              {myReviews.map((review) => {
                const job = review.order?.job || {};
                const worker = review.worker || {};

                return (
                  <Card key={review.id} className="mb-4 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <Row>
                        <Col md={9}>
                          {/* Job and Rating */}
                          <div className="d-flex align-items-center gap-3 mb-3">
                            <FaBriefcase className="text-info" size={20} />
                            <h5 className="mb-0 fw-bold">{job.title || 'N/A'}</h5>
                            <div className="d-flex align-items-center gap-2">
                              {renderStars(review.rating)}
                              <Badge bg="warning" text="dark" className="rounded-pill">
                                {review.rating}/5
                              </Badge>
                            </div>
                          </div>

                          {/* Worker Info */}
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <FaUserCircle size={20} className="text-info" />
                            <span className="fw-semibold">
                              Worker: {worker.fname} {worker.lname}
                            </span>
                            <span className="text-muted small">
                              • Reviewed on {formatDate(review.createdAt)}
                            </span>
                          </div>

                          {/* Your Review Comment */}
                          <div className="mb-3 p-3 bg-light rounded">
                            <div className="small text-muted mb-1 fw-semibold">Your Review</div>
                            <p className="mb-0">{review.comment}</p>
                          </div>

                          {/* Worker Reply */}
                          {review.workerReply && (
                            <div className="ms-4 p-3 bg-info bg-opacity-10 rounded border-start border-info border-3">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <FaReply className="text-info" />
                                <span className="fw-semibold small">Worker's Reply</span>
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
                          <div className="text-center p-3 bg-light rounded w-100">
                            <div className="small text-muted mb-1">Order Completed</div>
                            <div className="small fw-semibold">
                              {formatDate(review.order?.completedDate)}
                            </div>
                          </div>
                          {review.workerReply ? (
                            <Badge bg="success" className="px-3 py-2 w-100">
                              <FaReply className="me-1" />
                              Worker Replied
                            </Badge>
                          ) : (
                            <Badge bg="secondary" className="px-3 py-2 w-100">
                              No Reply Yet
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
