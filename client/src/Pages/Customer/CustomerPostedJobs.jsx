
import TopNavbar from '../../Components/TopNavbar';
import React, { useEffect, useState } from "react";
import { Table, Badge, Button, Card } from "react-bootstrap";
import Footer from '../../Components/Footer';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';

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
  //const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get("/api/jobs")
      .then(res => {
        console.log("Response data:", res.data);
        // Server returns { message, jobs } for jobs endpoints
        const postedJobsData = res.data.jobs || res.data.postedJobs || res.data;
        //console.log("Response new data:", postedJobsData);
        setPostedJobs(postedJobsData);
        //setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching jobs:", err);
        //setLoading(false);
      });
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
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-warning"
                      className="rounded-pill px-3"
                      onClick={() => navigate(`/jobs/edit/${job.id}`)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="rounded-pill px-3"
                      onClick={() => handleDelete(job.id)}
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

      <Footer />
    </div>
  );

}


