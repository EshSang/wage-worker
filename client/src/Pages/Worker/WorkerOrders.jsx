import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { FaMapMarkerAlt, FaRegCalendarAlt, FaBriefcase } from 'react-icons/fa';
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';
import axiosInstance from '../../api/axios';

export default function WorkerOrders() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const response = await axiosInstance.get('/api/applications/my-applications');
      console.log("Applications:", response.data);
      setApplications(response.data.applications || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'withdrawn':
        return 'secondary';
      default:
        return 'warning';
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
          <h2 className="fw-bold mb-4">My Job Applications</h2>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading your applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <Card className="border-0 shadow-sm text-center py-5">
              <Card.Body>
                <FaBriefcase size={60} className="text-muted mb-3" />
                <h4>No Applications Yet</h4>
                <p className="text-muted">
                  You haven't applied to any jobs yet. Start browsing jobs and apply!
                </p>
                <Button variant="info" className="text-white mt-3" href="/workerjob">
                  Browse Jobs
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <div>
              {applications.map((application) => {
                const job = application.job || {};
                return (
                  <Card key={application.id} className="mb-4 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <Row>
                        <Col md={9}>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <h5 className="mb-0 fw-bold">{job.title || 'N/A'}</h5>
                            <Badge bg={getStatusColor(application.applicationStatus)} className="rounded-pill">
                              {application.applicationStatus || 'Pending'}
                            </Badge>
                          </div>

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
                              Applied {getDaysAgo(application.appliedDate)}
                            </span>
                          </div>

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

                        <Col md={3} className="d-flex flex-column justify-content-center align-items-end">
                          <div className="text-end mb-2">
                            <div className="small text-muted">Hourly Rate</div>
                            <h5 className="mb-0 text-info">LKR {job.hourlyRate || 0}</h5>
                          </div>
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
    </div>
  );
}
