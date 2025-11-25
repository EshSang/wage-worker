import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Card, Badge, InputGroup, Modal } from "react-bootstrap";
import { FaMapMarkerAlt, FaRegCalendarAlt, FaBriefcase, FaSearch, FaUser, FaPhone, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import TopNavbar from "../../Components/TopNavbar";
import Footer from "../../Components/Footer";
import './CustomerJobs.css';

const CustomerJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  // Fetch jobs from backend
  useEffect(() => {
    axiosInstance
      .get("/api/jobs")
      .then((res) => {
        const jobsData = res.data.jobs || res.data;
        setJobs(jobsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      });
  }, []);

  // Filter jobs by search
  const filteredJobs = jobs.filter((job) => {
    const categoryName = job.category?.category || '';
    return (
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort by most recent
  const sortedJobs = [...filteredJobs].sort(
    (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
  );

  // Calculate days ago
  const getDaysAgo = (date) => {
    const diff = new Date() - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };


// Calculate minutes ago
// const getMinutesAgo = (date) => {
//   const diff = new Date() - new Date(date);
//   const minutes = Math.floor(diff / (1000 * 60));

//   if (minutes === 0) return 'Just now';
//   if (minutes === 1) return '1 minute ago';
//   return `${minutes} minutes ago`;
// };



  return (
    <div>
      <div className="min-vh-100 d-flex flex-column bg-light">
        <TopNavbar />

        <Container className="my-4">
          {/* Search Bar */}
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup className="shadow-sm search-input-group">
                <InputGroup.Text className="bg-white border-0">
                  <FaSearch size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by job title, category, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0"
                />
              </InputGroup>
            </Col>
          </Row>

          <hr className="my-4" />

          {/* Filter Badge */}
          <div className="d-flex align-items-center gap-3 mb-3">
            <Button disabled variant="outline-dark" className="no-hover">
              <FaRegCalendarAlt className="me-2" />
              Most Recent
            </Button>
            {searchTerm && (
              <Badge bg="info" className="px-3 py-2">
                Searching: "{searchTerm}"
              </Badge>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading jobs...</p>
            </div>
          ) : sortedJobs.length === 0 ? (
            <Card className="border-0 shadow-sm text-center py-5">
              <Card.Body>
                <FaBriefcase size={60} className="text-muted mb-3" />
                <h4>No jobs found</h4>
                <p className="text-muted">
                  {searchTerm ? "Try adjusting your search terms" : "Check back later for new opportunities"}
                </p>
              </Card.Body>
            </Card>
          ) : (
            /* Jobs List */
            <div className="job-cards-container">
              {sortedJobs.map((job, index) => (
                <Card
                  key={job.id}
                  className="job-card mb-4 border-0 shadow-sm hover-lift"
                  style={{
                    animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
                    cursor: 'pointer'
                  }}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <h5 className="mb-0 fw-bold theme-primary">{job.title}</h5>
                          <Badge bg="success" className="rounded-pill">
                            {job.status || 'Open'}
                          </Badge>
                        </div>
                        <p className="text-muted mb-3" style={{ lineHeight: '1.6' }}>
                          {job.description}
                        </p>
                      </div>
                    </div>

                    {/* Job Category Badge */}
                    <div className="mb-3">
                      <Badge bg="light" text="dark" className="px-3 py-2 me-2">
                        <FaBriefcase size={14} className="me-1" />
                        {job.category?.category || 'N/A'}
                      </Badge>
                    </div>

                    {/* Skills */}
                    {job.skills && (
                      <div className="mb-3 d-flex flex-wrap gap-2">
                        {job.skills.split(',').slice(0, 4).map((skill, idx) => (
                          <Badge
                            key={idx}
                            bg="secondary"
                            className="px-2 py-1 fw-normal"
                            style={{ fontSize: '0.85rem' }}
                          >
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                      <div className="d-flex align-items-center gap-3 text-secondary small">
                        <span className="d-flex align-items-center">
                          <FaMapMarkerAlt size={16} className="me-1" />
                          {job.location}
                        </span>
                        <span className="d-flex align-items-center">
                          <FaRegCalendarAlt size={16} className="me-1" />
                          {getDaysAgo(job.postedDate)}
                          {/* {getMinutesAgo(job.postedDate)} */}
                        </span>
                      </div>
                      <Button
                        variant="info"
                        size="sm"
                        className="px-4 rounded-pill text-white"
                        onClick={() => handleViewDetails(job)}
                      >
                        View Details →
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </div>
      <Footer />

      {/* Job Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">{selectedJob?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {selectedJob && (
            <div>
              {/* Status and Category */}
              <div className="d-flex gap-2 mb-3">
                <Badge bg="success" className="px-3 py-2">
                  {selectedJob.status || 'Open'}
                </Badge>
                <Badge bg="light" text="dark" className="px-3 py-2">
                  <FaBriefcase size={14} className="me-1" />
                  {selectedJob.category?.category || 'N/A'}
                </Badge>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h6 className="fw-bold mb-2">Job Description</h6>
                <p className="text-muted" style={{ textAlign: 'justify', lineHeight: '1.6' }}>
                  {selectedJob.description}
                </p>
              </div>

              {/* Skills */}
              {selectedJob.skills && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">Required Skills</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedJob.skills.split(',').map((skill, idx) => (
                      <Badge key={idx} bg="secondary" className="px-2 py-1">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Location and Pay */}
              <div className="mb-4">
                <Row>
                  <Col md={6}>
                    <div className="d-flex align-items-center mb-2">
                      <FaMapMarkerAlt className="text-info me-2" />
                      <div>
                        <div className="small text-muted">Location</div>
                        <div className="fw-semibold">{selectedJob.location}</div>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex align-items-center mb-2">
                      <FaRegCalendarAlt className="text-info me-2" />
                      <div>
                        <div className="small text-muted">Posted</div>
                        <div className="fw-semibold">{getDaysAgo(selectedJob.postedDate)}</div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Hourly Rate */}
              <div className="p-3 bg-light rounded text-center">
                <div className="small text-muted">Hourly Rate</div>
                <h4 className="mb-0 text-info">LKR {selectedJob.hourlyRate || 0}</h4>
              </div>

              {/* Contact Information */}
              <div className="mt-4 pt-3 border-top">
                <h6 className="fw-bold mb-3">Contact Information</h6>
                <Row>
                  <Col md={4}>
                    <div className="mb-2">
                      <FaUser className="text-info me-2" />
                      <span className="small text-muted">Customer:</span>
                      <div className="fw-semibold">{selectedJob.customerName}</div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="mb-2">
                      <FaPhone className="text-info me-2" />
                      <span className="small text-muted">Phone:</span>
                      <div className="fw-semibold">{selectedJob.customerPhone}</div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="mb-2">
                      <FaHome className="text-info me-2" />
                      <span className="small text-muted">Address:</span>
                      <div className="fw-semibold">{selectedJob.customerAddress}</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CustomerJobs;
