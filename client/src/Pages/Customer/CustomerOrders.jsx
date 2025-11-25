import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { FaUser, FaRegCalendarAlt, FaBriefcase, FaEnvelope, FaPhone } from 'react-icons/fa';
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';
import axiosInstance from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CustomerOrders() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationsForMyJobs();
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
          <h2 className="fw-bold mb-4">Job Applications</h2>
          <p className="text-muted mb-4">Manage applications for your posted jobs</p>

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
                          {application.applicationStatus === 'Pending' && (
                            <>
                              <Button
                                variant="success"
                                className="w-100"
                                onClick={() => handleUpdateStatus(application.id, 'Accepted')}
                              >
                                Accept Application
                              </Button>
                              <Button
                                variant="danger"
                                className="w-100"
                                onClick={() => handleUpdateStatus(application.id, 'Rejected')}
                              >
                                Reject Application
                              </Button>
                            </>
                          )}
                          {application.applicationStatus !== 'Pending' && (
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
