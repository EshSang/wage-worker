import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Badge, Card, Spinner } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';
import axiosInstance from '../api/axios';

const WorkerDetailsModal = ({ show, worker, onHire, onClose }) => {
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (show && worker) {
      fetchWorkerDetails();
    }
  }, [show, worker]);

  const fetchWorkerDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/api/workers/${worker.id}/detailed-profile`
      );
      console.log('Worker detailed profile:', response.data);
      setProfile(response.data.data?.profile || response.data.profile);
      setRecentJobs(response.data.data?.profile?.recentJobs || response.data.profile?.recentJobs || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching worker details:', error);
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {worker?.fname} {worker?.lname} - Profile
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="info" />
            <p className="mt-3 text-muted">Loading worker details...</p>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="profile-header mb-4">
              <Row>
                <Col md={3} className="text-center">
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      backgroundColor: '#17a2b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '48px',
                      fontWeight: 'bold',
                      margin: '0 auto'
                    }}
                  >
                    {worker?.fname?.charAt(0).toUpperCase()}
                    {worker?.lname?.charAt(0).toUpperCase()}
                  </div>
                </Col>
                <Col md={9}>
                  <h4>{worker?.fname} {worker?.lname}</h4>
                  <div className="rating mb-2">
                    <FaStar className="text-warning" />
                    <strong className="ms-1">
                      {worker?.stats?.averageRating > 0 ? worker.stats.averageRating.toFixed(1) : 'N/A'}
                    </strong>
                    <span className="text-muted ms-1">
                      ({worker?.stats?.totalReviews || 0} reviews)
                    </span>
                  </div>
                  <p className="text-muted">{worker?.about || 'No bio available'}</p>
                  <div className="mb-2">
                    <FaMapMarkerAlt className="text-info" />
                    <span className="ms-2">{worker?.location || worker?.address || 'Not specified'}</span>
                  </div>
                  <div className="mb-2">
                    <FaBriefcase className="text-info" />
                    <span className="ms-2">{worker?.stats?.completedJobs || 0} jobs completed</span>
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {worker?.email}
                  </div>
                  {worker?.phonenumber && (
                    <div className="mb-2">
                      <strong>Phone:</strong> {worker?.phonenumber}
                    </div>
                  )}
                </Col>
              </Row>
            </div>

            {/* Skills Section */}
            <div className="skills-section mb-4">
              <h6 className="fw-bold mb-3">Skills</h6>
              <div>
                {worker?.skills?.split(',').map((skill, idx) => (
                  <Badge key={idx} bg="info" className="me-2 mb-2">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recent Jobs Section */}
            <div className="recent-jobs-section mb-4">
              <h6 className="fw-bold mb-3">Recent 5 Jobs</h6>
              {recentJobs && recentJobs.length > 0 ? (
                recentJobs.map((job, idx) => (
                  <Card key={idx} className="mb-3 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="text-info mb-1">{job.title}</h6>
                          <Badge bg="light" text="dark">
                            {job.category?.category || 'General'}
                          </Badge>
                        </div>
                        <div className="text-end">
                          <div className="rating mb-1">
                            {job.review ? (
                              <>
                                <FaStar className="text-warning" />
                                <span className="ms-1 fw-bold">{job.review.rating}/5</span>
                              </>
                            ) : (
                              <span className="text-muted">No review</span>
                            )}
                          </div>
                          <small className="text-muted">
                            Completed: {job.completedDate ? new Date(job.completedDate).toLocaleDateString() : 'N/A'}
                          </small>
                        </div>
                      </div>
                      {job.review && job.review.comment && (
                        <p className="text-muted mt-2 mb-0 small">
                          <em>"{job.review.comment}"</em>
                        </p>
                      )}
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <p className="text-muted text-center py-3">No recent jobs completed yet</p>
              )}
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="info" onClick={onHire}>
          <FaBriefcase className="me-2" />
          Hire This Worker
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WorkerDetailsModal;
