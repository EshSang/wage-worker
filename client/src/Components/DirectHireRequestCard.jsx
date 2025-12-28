import React, { useState } from 'react';
import { Card, Badge, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { FaBolt, FaMapMarkerAlt, FaBriefcase, FaPhone, FaEnvelope, FaRegCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa';

const DirectHireRequestCard = ({ request, onAccept, onReject }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    onReject(request.id, rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
  };

  return (
    <>
      <Card className="mb-3 border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <div>
              <Badge bg="warning" className="mb-2">
                <FaBolt className="me-1" />
                DIRECT HIRE REQUEST
              </Badge>
              <h5 className="text-info mb-2">{request.job.title}</h5>
              <p className="text-muted mb-0">{request.job.description}</p>
            </div>
            <div className="text-end">
              <h6 className="text-success mb-0">LKR {request.job.hourlyRate}</h6>
              <small className="text-muted">Hourly Rate</small>
            </div>
          </div>

          <Row className="mt-3">
            <Col md={6}>
              <div className="mb-2">
                <strong>Customer:</strong> {request.job.createdUser.fname} {request.job.createdUser.lname}
              </div>
              <div className="mb-2">
                <FaMapMarkerAlt className="text-info" />
                <span className="ms-2">{request.job.location}</span>
              </div>
              <div className="mb-2">
                <FaBriefcase className="text-info" />
                <span className="ms-2">{request.job.category?.category}</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-2">
                <FaPhone className="text-info" />
                <span className="ms-2">{request.job.createdUser.phonenumber || 'Not provided'}</span>
              </div>
              <div className="mb-2">
                <FaEnvelope className="text-info" />
                <span className="ms-2">{request.job.createdUser.email}</span>
              </div>
              <div className="mb-2">
                <FaRegCalendarAlt className="text-info" />
                <span className="ms-2">Sent {new Date(request.appliedDate).toLocaleDateString()}</span>
              </div>
            </Col>
          </Row>

          <div className="d-flex gap-2 mt-4">
            <Button
              variant="success"
              onClick={() => onAccept(request.id)}
              className="flex-grow-1"
            >
              <FaCheck className="me-2" />
              Accept Job Request
            </Button>
            <Button
              variant="outline-danger"
              onClick={() => setShowRejectModal(true)}
              className="flex-grow-1"
            >
              <FaTimes className="me-2" />
              Decline
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Decline Job Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to decline this job request?</p>
          <Form.Group>
            <Form.Label>Reason (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Let the customer know why you're declining..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject}>
            Confirm Decline
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DirectHireRequestCard;
