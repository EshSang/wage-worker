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
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';

export default function ReviewerJobs() {
  const [filters, setFilters] = useState({
    search: "",
    approvalStatus: "PENDING",
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [filters.approvalStatus]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/reviewer/jobs', {
        params: {
          approvalStatus: filters.approvalStatus,
          search: filters.search || undefined,
        }
      });

      if (response.data.success) {
        // The response contains { jobs, pagination }
        setJobs(response.data.data.jobs || response.data.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchJobs();
  };

  const handleApprove = async (jobId) => {
    try {
      setActionLoading(true);
      const response = await axiosInstance.put(`/api/reviewer/jobs/${jobId}/approve`);

      if (response.data.success) {
        toast.success('Job approved successfully');
        fetchJobs();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error approving job:', error);
      toast.error(error.response?.data?.message || 'Failed to approve job');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedJob) return;

    try {
      setActionLoading(true);
      const response = await axiosInstance.put(`/api/reviewer/jobs/${selectedJob.id}/reject`, {
        reason: rejectReason
      });

      if (response.data.success) {
        toast.success('Job rejected successfully');
        fetchJobs();
        setShowRejectModal(false);
        setShowDetailModal(false);
        setRejectReason("");
      }
    } catch (error) {
      console.error('Error rejecting job:', error);
      toast.error(error.response?.data?.message || 'Failed to reject job');
    } finally {
      setActionLoading(false);
    }
  };

  const statusVariant = (status) => {
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

  const pendingJobs = jobs.filter(job => job.approvalStatus === 'PENDING').length;
  const approvedJobs = jobs.filter(job => job.approvalStatus === 'APPROVED').length;
  const rejectedJobs = jobs.filter(job => job.approvalStatus === 'REJECTED').length;

  return (
    <div>
      <TopNavbar />
      <div className="px-4 py-4 bg-light min-vh-100">

        {/* Page Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold">Job Approval Management</h4>
        </div>

        {/* Stats Cards */}
        <Row className="g-3 mb-4">
          {[
            { title: "Total Jobs", value: jobs.length },
            { title: "Pending Approval", value: pendingJobs },
            { title: "Approved", value: approvedJobs },
            { title: "Rejected", value: rejectedJobs },
          ].map((item, index) => (
            <Col md={3} key={index}>
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
                  placeholder="Search by job title or category"
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

        {/* Jobs Table */}
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center p-5">
                <p className="text-muted">No jobs found</p>
              </div>
            ) : (
              <Table hover responsive className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Job Title</th>
                    <th>Category</th>
                    <th>Posted By</th>
                    <th>Posted Date</th>
                    <th>Rate</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <div className="fw-semibold">{job.title}</div>
                        <small className="text-muted">
                          {job.description?.substring(0, 40)}
                          {job.description?.length > 40 ? '...' : ''}
                        </small>
                      </td>
                      <td>{job.category?.category || 'N/A'}</td>
                      <td>
                        {job.createdUser ?
                          `${job.createdUser.fname} ${job.createdUser.lname}` :
                          'N/A'}
                      </td>
                      <td>{new Date(job.postedDate).toLocaleDateString()}</td>
                      <td className="fw-semibold">LKR {job.hourlyRate}/hr</td>
                      <td>
                        <Badge bg={statusVariant(job.approvalStatus)} pill>
                          {job.approvalStatus}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button
                          variant="light"
                          size="sm"
                          className="me-2 border"
                          onClick={() => {
                            setSelectedJob(job);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye /> View
                        </Button>
                        {job.approvalStatus === 'PENDING' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              className="me-2"
                              onClick={() => handleApprove(job.id)}
                              disabled={actionLoading}
                            >
                              <CheckCircle /> Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setSelectedJob(job);
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

      {/* Job Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Job Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Job Title:</strong>
                  <p>{selectedJob.title}</p>
                </Col>
                <Col md={6}>
                  <strong>Category:</strong>
                  <p>{selectedJob.category?.category || 'N/A'}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Description:</strong>
                  <p>{selectedJob.description}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Location:</strong>
                  <p>{selectedJob.location}</p>
                </Col>
                <Col md={6}>
                  <strong>Hourly Rate:</strong>
                  <p>LKR {selectedJob.hourlyRate}/hr</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Skills Required:</strong>
                  <p>{selectedJob.skills}</p>
                </Col>
                <Col md={6}>
                  <strong>Posted Date:</strong>
                  <p>{new Date(selectedJob.postedDate).toLocaleDateString()}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Posted By:</strong>
                  <p>{selectedJob.createdUser ?
                    `${selectedJob.createdUser.fname} ${selectedJob.createdUser.lname}` :
                    'N/A'}</p>
                </Col>
                <Col md={6}>
                  <strong>Job Type:</strong>
                  <p>{selectedJob.jobType}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Approval Status:</strong>
                  <p>
                    <Badge bg={statusVariant(selectedJob.approvalStatus)}>
                      {selectedJob.approvalStatus}
                    </Badge>
                  </p>
                </Col>
              </Row>
              {selectedJob.reviewedBy && (
                <Row className="mb-3">
                  <Col md={6}>
                    <strong>Reviewed By:</strong>
                    <p>{selectedJob.reviewer ?
                      `${selectedJob.reviewer.fname} ${selectedJob.reviewer.lname}` :
                      'N/A'}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Reviewed At:</strong>
                    <p>{new Date(selectedJob.reviewedAt).toLocaleString()}</p>
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedJob?.approvalStatus === 'PENDING' && (
            <>
              <Button
                variant="success"
                onClick={() => handleApprove(selectedJob.id)}
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
          <Modal.Title>Reject Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason for Rejection (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this job..."
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
