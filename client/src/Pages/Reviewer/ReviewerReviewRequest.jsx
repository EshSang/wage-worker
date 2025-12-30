import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Badge,
  Button,
  Row,
  Col,
  Form,
  Modal,
  Spinner,
} from "react-bootstrap";
import { Eye, CheckCircle, XCircle } from "react-bootstrap-icons";
import { Star, StarFill } from "react-bootstrap-icons";
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';

export default function ReviewerReviewRequest() {
  const [filters, setFilters] = useState({
    search: "",
    approvalStatus: "PENDING",
  });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [filters.approvalStatus]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/reviewer/reviews', {
        params: {
          approvalStatus: filters.approvalStatus,
          search: filters.search || undefined,
        }
      });

      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchReviews();
  };

  const handleApprove = async (reviewId) => {
    try {
      setActionLoading(true);
      const response = await axiosInstance.put(`/api/reviewer/reviews/${reviewId}/approve`);

      if (response.data.success) {
        toast.success('Review approved successfully');
        fetchReviews();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error(error.response?.data?.message || 'Failed to approve review');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReview) return;

    try {
      setActionLoading(true);
      const response = await axiosInstance.put(`/api/reviewer/reviews/${selectedReview.id}/reject`, {
        reason: rejectReason
      });

      if (response.data.success) {
        toast.success('Review rejected successfully');
        fetchReviews();
        setShowRejectModal(false);
        setShowDetailModal(false);
        setRejectReason("");
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error(error.response?.data?.message || 'Failed to reject review');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "danger";
      default:
        return "secondary";
    }
  };

  const renderStars = (rating) => {
    return (
      <div>
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? <StarFill key={star} className="text-warning" /> : <Star key={star} className="text-muted" />
        ))}
      </div>
    );
  };

  const pendingReviews = reviews.filter(r => r.approvalStatus === 'PENDING').length;
  const approvedReviews = reviews.filter(r => r.approvalStatus === 'APPROVED').length;
  const rejectedReviews = reviews.filter(r => r.approvalStatus === 'REJECTED').length;

  return (
    <div>
      <TopNavbar />
      <div className="px-4 py-4 bg-light min-vh-100">

        {/* Header */}
        <h4 className="fw-bold mb-4">Review Moderation</h4>

        {/* Stats */}
        <Row className="g-3 mb-4">
          {[
            { title: "Pending Reviews", value: pendingReviews },
            { title: "Approved", value: approvedReviews },
            { title: "Rejected", value: rejectedReviews },
          ].map((item, index) => (
            <Col md={4} key={index}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body>
                  <h6 className="text-muted">{item.title}</h6>
                  <h3 className="fw-bold">{item.value}</h3>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filters */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Label>Search</Form.Label>
                <Form.Control
                  placeholder="Search by comment"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </Col>
              <Col md={3}>
                <Form.Label>Approval Status</Form.Label>
                <Form.Select
                  value={filters.approvalStatus}
                  onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value })}
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button variant="primary" className="w-100" onClick={handleSearch}>
                  Search
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Reviews Table */}
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center p-5">
                <p className="text-muted">No reviews found</p>
              </div>
            ) : (
              <Table hover responsive className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Job</th>
                    <th>Reviewer</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td>
                        <div className="fw-semibold">{review.order?.job?.title || 'N/A'}</div>
                        <small className="text-muted">{review.order?.job?.category?.category || 'N/A'}</small>
                      </td>
                      <td>
                        {review.reviewer ?
                          `${review.reviewer.fname} ${review.reviewer.lname}` :
                          'N/A'}
                      </td>
                      <td>{renderStars(review.rating)}</td>
                      <td>
                        <div style={{ maxWidth: '200px' }}>
                          {review.comment?.substring(0, 50)}
                          {review.comment?.length > 50 ? '...' : ''}
                        </div>
                      </td>
                      <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Badge bg={statusBadge(review.approvalStatus)} pill>
                          {review.approvalStatus}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button
                          size="sm"
                          variant="light"
                          className="me-2 border"
                          onClick={() => {
                            setSelectedReview(review);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye /> View
                        </Button>
                        {review.approvalStatus === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              className="me-2"
                              onClick={() => handleApprove(review.id)}
                              disabled={actionLoading}
                            >
                              <CheckCircle /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setSelectedReview(review);
                                setShowRejectModal(true);
                              }}
                              disabled={actionLoading}
                            >
                              <XCircle /> Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Review Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Review Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReview && (
            <div>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Job:</strong>
                  <p>{selectedReview.order?.job?.title || 'N/A'}</p>
                  <small className="text-muted">{selectedReview.order?.job?.category?.category || 'N/A'}</small>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Reviewer:</strong>
                  <p>
                    {selectedReview.reviewer ?
                      `${selectedReview.reviewer.fname} ${selectedReview.reviewer.lname}` :
                      'N/A'}
                  </p>
                  <small className="text-muted">{selectedReview.reviewer?.email || 'N/A'}</small>
                </Col>
                <Col md={6}>
                  <strong>Customer:</strong>
                  <p>
                    {selectedReview.order?.user ?
                      `${selectedReview.order.user.fname} ${selectedReview.order.user.lname}` :
                      'N/A'}
                  </p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Rating:</strong>
                  <p>{renderStars(selectedReview.rating)} ({selectedReview.rating}/5)</p>
                </Col>
                <Col md={6}>
                  <strong>Review Date:</strong>
                  <p>{new Date(selectedReview.createdAt).toLocaleString()}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Comment:</strong>
                  <p>{selectedReview.comment}</p>
                </Col>
              </Row>
              {selectedReview.workerReply && (
                <Row className="mb-3">
                  <Col md={12}>
                    <strong>Worker Reply:</strong>
                    <p>{selectedReview.workerReply}</p>
                    <small className="text-muted">
                      Replied at: {new Date(selectedReview.repliedAt).toLocaleString()}
                    </small>
                  </Col>
                </Row>
              )}
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Approval Status:</strong>
                  <p>
                    <Badge bg={statusBadge(selectedReview.approvalStatus)}>
                      {selectedReview.approvalStatus}
                    </Badge>
                  </p>
                </Col>
              </Row>
              {selectedReview.reviewedBy && (
                <Row className="mb-3">
                  <Col md={6}>
                    <strong>Approved By:</strong>
                    <p>
                      {selectedReview.approver ?
                        `${selectedReview.approver.fname} ${selectedReview.approver.lname}` :
                        'N/A'}
                    </p>
                  </Col>
                  <Col md={6}>
                    <strong>Approved At:</strong>
                    <p>{new Date(selectedReview.reviewedAt).toLocaleString()}</p>
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedReview?.approvalStatus === 'PENDING' && (
            <>
              <Button
                variant="success"
                onClick={() => handleApprove(selectedReview.id)}
                disabled={actionLoading}
              >
                {actionLoading ? <Spinner animation="border" size="sm" /> : <CheckCircle />} Approve
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowDetailModal(false);
                  setShowRejectModal(true);
                }}
                disabled={actionLoading}
              >
                <XCircle /> Reject
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Reason Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason for Rejection (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this review..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={actionLoading}
          >
            {actionLoading ? <Spinner animation="border" size="sm" /> : 'Confirm Reject'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </div>
  );
}
