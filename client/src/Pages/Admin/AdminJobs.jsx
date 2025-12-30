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
import { Eye } from "react-bootstrap-icons";
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';

export default function AdminJobs() {
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    categoryId: "All",
    date: "",
  });

  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    cancelledJobs: 0,
  });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
  });

  // Modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchStatistics();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [filters, pagination.currentPage]);

  const fetchStatistics = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/jobs/statistics');
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/categories');
      setCategories(response.data.categories || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.pageSize,
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters.categoryId && filters.categoryId !== 'All') params.append('categoryId', filters.categoryId);
      if (filters.date) params.append('date', filters.date);

      const response = await axiosInstance.get(`/api/admin/jobs?${params}`);

      if (response.data.success) {
        setJobs(response.data.data.jobs);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetails = async (jobId) => {
    try {
      const response = await axiosInstance.get(`/api/admin/jobs/${jobId}`);
      if (response.data.success) {
        setSelectedJob(response.data.data);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
    }
  };

  const handleViewJob = (job) => {
    fetchJobDetails(job.id);
  };

  const getJobStatus = (job) => {
    // Check if job has an active order
    if (job.orders && job.orders.length > 0) {
      const latestOrder = job.orders[0];
      if (latestOrder.status === 'ACCEPTED') return 'Active';
      if (latestOrder.status === 'COMPLETED') return 'Completed';
      if (latestOrder.status === 'CANCELLED') return 'Cancelled';
      if (latestOrder.status === 'PENDING') return 'Pending';
    }

    // If job is open and has applications
    if (job.status === 'Open' && job._count?.jobApplications > 0) {
      return 'Pending';
    }

    // If job is closed
    if (job.status === 'Closed') {
      return 'Cancelled';
    }

    return 'Pending';
  };

  const getWorkerName = (job) => {
    if (job.orders && job.orders.length > 0) {
      const worker = job.orders[0].user;
      return `${worker.fname} ${worker.lname}`;
    }
    return '—';
  };

  const statusVariant = (status) => {
    switch (status) {
      case "Active":
        return "primary";
      case "Pending":
        return "warning";
      case "Completed":
        return "success";
      case "Cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div>
      <TopNavbar />
      <div className="px-4 py-4 bg-light min-vh-100">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold">Jobs</h4>
        </div>

        {/* Stats Cards */}
        <Row className="g-3 mb-4">
          {[
            { title: "Total Jobs", value: statistics.totalJobs },
            { title: "Active Jobs", value: statistics.activeJobs },
            { title: "Completed", value: statistics.completedJobs },
            { title: "Cancelled", value: statistics.cancelledJobs },
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
            <Row className="g-3">
              <Col md={3}>
                <Form.Control
                  placeholder="🔍 Search Job / Customer"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </Col>

              <Col md={3}>
                <Form.Select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </Form.Select>
              </Col>

              <Col md={3}>
                <Form.Select
                  value={filters.categoryId}
                  onChange={(e) =>
                    setFilters({ ...filters, categoryId: e.target.value })
                  }
                >
                  <option value="All">All Services</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={3}>
                <Form.Control
                  type="date"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters({ ...filters, date: e.target.value })
                  }
                />
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
                    <th>Job ID</th>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Worker</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const jobStatus = getJobStatus(job);
                    return (
                      <tr key={job.id}>
                        <td className="fw-semibold">JOB-{job.id}</td>
                        <td>{job.category?.category || 'N/A'}</td>
                        <td>
                          {job.createdUser
                            ? `${job.createdUser.fname} ${job.createdUser.lname}`
                            : 'N/A'}
                        </td>
                        <td>{getWorkerName(job)}</td>
                        <td>{new Date(job.postedDate).toLocaleDateString()}</td>
                        <td>
                          <Badge bg={statusVariant(jobStatus)} pill>
                            {jobStatus}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button
                            variant="light"
                            size="sm"
                            className="border"
                            onClick={() => handleViewJob(job)}
                          >
                            <Eye />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              disabled={pagination.currentPage === 1}
              onClick={() =>
                setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })
              }
            >
              Previous
            </Button>
            <span className="align-self-center mx-3">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline-primary"
              size="sm"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() =>
                setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })
              }
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* View Job Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Job Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <p className="mb-2">
                    <strong>Job ID:</strong> JOB-{selectedJob.id}
                  </p>
                  <p className="mb-2">
                    <strong>Title:</strong> {selectedJob.title}
                  </p>
                  <p className="mb-2">
                    <strong>Category:</strong> {selectedJob.category?.category}
                  </p>
                  <p className="mb-2">
                    <strong>Hourly Rate:</strong> LKR {selectedJob.hourlyRate}
                  </p>
                </Col>
                <Col md={6}>
                  <p className="mb-2">
                    <strong>Location:</strong> {selectedJob.location}
                  </p>
                  <p className="mb-2">
                    <strong>Posted Date:</strong>{' '}
                    {new Date(selectedJob.postedDate).toLocaleDateString()}
                  </p>
                  <p className="mb-2">
                    <strong>Status:</strong>{' '}
                    <Badge bg={selectedJob.status === 'Open' ? 'success' : 'secondary'}>
                      {selectedJob.status}
                    </Badge>
                  </p>
                  <p className="mb-2">
                    <strong>Job Type:</strong> {selectedJob.jobType}
                  </p>
                </Col>
              </Row>

              <div className="mb-3">
                <strong>Description:</strong>
                <p className="mt-2">{selectedJob.description}</p>
              </div>

              <div className="mb-3">
                <strong>Skills:</strong>
                <p className="mt-2">{selectedJob.skills || 'N/A'}</p>
              </div>

              <div className="mb-3">
                <strong>Customer:</strong>
                <p className="mt-2">
                  {selectedJob.createdUser
                    ? `${selectedJob.createdUser.fname} ${selectedJob.createdUser.lname} (${selectedJob.createdUser.email})`
                    : 'N/A'}
                </p>
              </div>

              {selectedJob.jobApplications && selectedJob.jobApplications.length > 0 && (
                <div className="mb-3">
                  <strong>Applications ({selectedJob.jobApplications.length}):</strong>
                  <Table striped bordered size="sm" className="mt-2">
                    <thead>
                      <tr>
                        <th>Worker</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedJob.jobApplications.map((app) => (
                        <tr key={app.id}>
                          <td>
                            {app.user
                              ? `${app.user.fname} ${app.user.lname}`
                              : 'N/A'}
                          </td>
                          <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                          <td>
                            <Badge bg="info">{app.applicationStatus}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {selectedJob.orders && selectedJob.orders.length > 0 && (
                <div>
                  <strong>Orders ({selectedJob.orders.length}):</strong>
                  <Table striped bordered size="sm" className="mt-2">
                    <thead>
                      <tr>
                        <th>Worker</th>
                        <th>Accepted Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedJob.orders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            {order.user
                              ? `${order.user.fname} ${order.user.lname}`
                              : 'N/A'}
                          </td>
                          <td>{new Date(order.acceptedDate).toLocaleDateString()}</td>
                          <td>
                            <Badge bg={statusVariant(order.status === 'ACCEPTED' ? 'Active' : order.status === 'COMPLETED' ? 'Completed' : 'Cancelled')}>
                              {order.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </div>
  );
}
