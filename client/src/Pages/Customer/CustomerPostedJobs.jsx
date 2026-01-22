
import TopNavbar from '../../Components/TopNavbar';
import React, { useEffect, useState } from "react";
import { Table, Badge, Button, Card, Modal, Row, Col } from "react-bootstrap";
import Footer from '../../Components/Footer';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CustomerPostedJobs() {

  //const [jobs, setJobs] = useState([]);

  // TEMP data (replace with API later)
  // useEffect(() => {
  //   setJobs([
  //     {
  //       id: 1,
  //       title: "Electrician Needed",
  //       category: "Electrical",
  //       location: "Colombo",
  //       rate: 2500,
  //       status: "OPEN",
  //       postedDate: "2025-12-17"
  //     },
  //     {
  //       id: 2,
  //       title: "Plumber for House",
  //       category: "Plumbing",
  //       location: "Galle",
  //       rate: 3000,
  //       status: "CLOSED",
  //       postedDate: "2025-12-15"
  //     }
  //   ]);
  // }, []);


  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  //const [loading, setLoading] = useState(true);

  const fetchMyJobs = () => {
    axiosInstance.get("/api/jobs/my-jobs")
      .then(res => {
        console.log("Response data:", res.data);
        // Server returns { message, jobs } for jobs endpoints
        const postedJobsData = res.data.jobs || res.data.postedJobs || res.data;

        // Filter jobs by createdUserId and exclude closed jobs
        const filteredJobs = postedJobsData.filter(job =>
          job.status && job.status.toLowerCase() !== 'closed'
        );

        console.log("Filtered jobs (excluding closed):", filteredJobs);
        setPostedJobs(filteredJobs);
        //setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching jobs:", err);
        //setLoading(false);
      });
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedJob(null);
  };

  const handleDelete = (jobId, jobTitle) => {
    if (window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      axiosInstance.delete(`/api/jobs/${jobId}`)
        .then(() => {
          console.log("Job deleted successfully");
          toast.success("Job deleted successfully!");
          // Refresh the jobs list
          fetchMyJobs();
        })
        .catch(err => {
          console.error("Error deleting job:", err);
          toast.error(err.response?.data?.message || "Failed to delete job. Please try again.");
        });
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  return (
    <div className="bg-light min-vh-100">
      <TopNavbar />

      <div className="container py-4 min-vh-100">
        {/* Header */}
        {/* <h5 className="fw-bold mb-3">📋 My Posted Jobs</h5> */}
        

        {/* Search bar */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <input
            type="text"
            className="form-control w-75 rounded-pill px-4"
            placeholder="Search by job title, category, or description..."
          />
          {/* <Button variant="outline-secondary" className="ms-3">
            📅 Most Recent
          </Button> */}
        </div>

        {/* Job Cards */}
        {postedJobs.length > 0 ? (
          postedJobs.map((job) => (
            <Card
              key={job.id}
              className="mb-4 shadow-sm border-0 rounded-4"
            >
              <Card.Body>
                {/* Title + Status */}
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="fw-bold text-primary mb-1">
                      {job.title}
                      <Badge
                        bg="success"
                        className="ms-2 px-3 py-1 rounded-pill"
                      >
                        {(job.status || "open").toUpperCase()}
                      </Badge>
                    </h5>

                    <p className="text-muted mb-2">
                      {job.description || "No description provided"}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="mb-2">
                  <Badge bg="light" text="dark" className="me-2 px-3 py-2">
                    🧰 {job.category?.category || job.category}
                  </Badge>
                </div>

                {/* Tags */}
                {job.tags && (
                  <div className="mb-3">
                    {job.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        bg="secondary"
                        className="me-2 rounded-pill"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <hr />

                {/* Footer */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  {/* Location & Date */}
                  <div className="text-muted small">
                    📍 {job.location} &nbsp;&nbsp;|&nbsp;&nbsp;
                    📅{" "}
                    {job.postedDate
                      ? new Date(job.postedDate).toLocaleDateString()
                      : "Today"}
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="rounded-pill px-3"
                      onClick={() => handleViewJob(job)}
                    >
                      View
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="rounded-pill px-3"
                      onClick={() => handleDelete(job.id, job.title)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>

          ))
        ) : (
          <Card className="text-center p-5 shadow-sm border-0">
            <p className="text-muted mb-0">No jobs posted yet</p>
          </Card>
        )}
      </div>

      {/* View Job Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Job Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <div>
              {/* Job Title and Status */}
              <div className="mb-4">
                <h4 className="fw-bold text-primary mb-2">{selectedJob.title}</h4>
                <Badge bg="success" className="px-3 py-2 rounded-pill">
                  {(selectedJob.status || "open").toUpperCase()}
                </Badge>
              </div>

              {/* Job Description */}
              <div className="mb-4">
                <h6 className="fw-bold text-secondary mb-2">Description</h6>
                <p className="text-muted">
                  {selectedJob.description || "No description provided"}
                </p>
              </div>

              {/* Job Details Grid */}
              <Row className="mb-4">
                <Col md={6} className="mb-3">
                  <h6 className="fw-bold text-secondary mb-2">Category</h6>
                  <Badge bg="light" text="dark" className="px-3 py-2">
                    🧰 {selectedJob.category?.category || selectedJob.category || "N/A"}
                  </Badge>
                </Col>
                <Col md={6} className="mb-3">
                  <h6 className="fw-bold text-secondary mb-2">Location</h6>
                  <p className="text-muted mb-0">
                    📍 {selectedJob.location || "N/A"}
                  </p>
                </Col>
                <Col md={6} className="mb-3">
                  <h6 className="fw-bold text-secondary mb-2">Hourly Rate</h6>
                  <p className="text-muted mb-0">
                    💰 LKR {selectedJob.hourlyRate || "N/A"}
                  </p>
                </Col>
                <Col md={6} className="mb-3">
                  <h6 className="fw-bold text-secondary mb-2">Posted Date</h6>
                  <p className="text-muted mb-0">
                    📅{" "}
                    {selectedJob.postedDate
                      ? new Date(selectedJob.postedDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </Col>
              </Row>

              {/* Skills */}
              {selectedJob.skills && (
                <div className="mb-4">
                  <h6 className="fw-bold text-secondary mb-2">Required Skills</h6>
                  <p className="text-muted">{selectedJob.skills}</p>
                </div>
              )}

              {/* Tags */}
              {selectedJob.tags && selectedJob.tags.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold text-secondary mb-2">Tags</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedJob.tags.map((tag, index) => (
                      <Badge key={index} bg="secondary" className="px-3 py-1 rounded-pill">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseViewModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

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


