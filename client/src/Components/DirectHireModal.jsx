import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaInfoCircle, FaPaperPlane } from 'react-icons/fa';
import axiosInstance from '../api/axios';
import { toast } from 'react-toastify';
import DirectHirePaymentModal from './DirectHirePaymentModal';

const DirectHireModal = ({ show, worker, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    location: '',
    hourlyRate: '',
    skills: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingJobData, setPendingJobData] = useState(null);

  useEffect(() => {
    if (show) {
      fetchCategories();
    }
  }, [show]);

  useEffect(() => {
    if (worker) {
      setFormData(prev => ({
        ...prev,
        hourlyRate: '',
        skills: worker.skills || '',
      }));
    }
  }, [worker]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/categories');
      console.log('Categories:', response.data);
      setCategories(response.data.categories || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description || !formData.categoryId ||
        !formData.location || !formData.hourlyRate) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Store job data and proceed to payment
    const jobData = {
      workerId: worker.id,
      ...formData,
      categoryId: parseInt(formData.categoryId),
      hourlyRate: parseInt(formData.hourlyRate),
    };

    setPendingJobData(jobData);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    console.log('handlePaymentSuccess called with payment intent ID:', paymentIntentId);

    try {
      setLoading(true);
      console.log('Sending direct hire request with data:', {
        ...pendingJobData,
        paymentIntentId: paymentIntentId,
      });

      const response = await axiosInstance.post('/api/direct-hire/request', {
        ...pendingJobData,
        paymentIntentId: paymentIntentId,
      });

      console.log('Direct hire response:', response.data);

      // Close payment modal first
      setShowPaymentModal(false);

      // Show success message
      toast.success('Payment successful! Job request sent to worker.');

      // Reset form
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        location: '',
        hourlyRate: '',
        skills: worker?.skills || '',
      });

      setPendingJobData(null);
      setLoading(false);

      // Close main modal
      onClose();

      // Call parent callback
      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (error) {
      console.error('Error sending job request:', error);
      toast.error(error.response?.data?.message || 'Failed to send job request');
      setLoading(false);
      setShowPaymentModal(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setPendingJobData(null);
  };

  return (
    <>
      <Modal show={show} onHide={onClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Create Job Request for {worker?.fname} {worker?.lname}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <Alert variant="info">
              <FaInfoCircle className="me-2" />
              You are sending a direct job request to this worker. Payment is required upfront before sending the request.
            </Alert>

          <Form.Group className="mb-3">
            <Form.Label>Job Title <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Fix kitchen sink leak"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Job Description <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed description of the work needed..."
              required
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Job Category <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Location <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Job location"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Hourly Rate (LKR) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="Enter hourly rate"
                  required
                  min="0"
                />
                <Form.Text className="text-muted">
                  Specify the payment amount for this job
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Required Skills</Form.Label>
                <Form.Control
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Comma separated skills"
                />
                <Form.Text className="text-muted">
                  Pre-filled with worker's skills
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="info" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane className="me-2" />
                Send Job Request
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>

    {pendingJobData && showPaymentModal && (
      <DirectHirePaymentModal
        show={showPaymentModal}
        onHide={handlePaymentCancel}
        jobData={pendingJobData}
        worker={worker}
        onSuccess={handlePaymentSuccess}
      />
    )}
    </>
  );
};

export default DirectHireModal;
