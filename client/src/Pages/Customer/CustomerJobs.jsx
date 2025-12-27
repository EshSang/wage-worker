import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Badge,
  InputGroup,
  Modal,
} from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaBriefcase,
  FaSearch,
  FaUser,
  FaPhone,
  FaHome,
} from "react-icons/fa";
import axiosInstance from "../../api/axios";
import TopNavbar from "../../Components/TopNavbar";
import Footer from "../../Components/Footer";
import "./CustomerJobs.css";

const CustomerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [requirements, setRequirements] = useState("");
  const [activeTab, setActiveTab] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /* ---------------- FETCH JOBS ---------------- */
  useEffect(() => {
    axiosInstance
      .get("/api/jobs")
      .then((res) => {
        setJobs(res.data.jobs || res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      });
  }, []);

  /* ---------------- SEARCH FILTER ---------------- */
  const filteredJobs = jobs.filter((job) => {
    const categoryName = job.category?.category || "";
    return (
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  /* ---------------- MOST RECENT ---------------- */
  const sortedJobs = [...filteredJobs].sort(
    (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
  );

  /* ---------------- MATCHING LOGIC ---------------- */
  const getMatchScore = (job, requirementText) => {
    if (!requirementText) return 0;

    const keywords = requirementText
      .toLowerCase()
      .split(",")
      .map((k) => k.trim());

    let score = 0;

    keywords.forEach((keyword) => {
      if (job.skills?.toLowerCase().includes(keyword)) score += 3;
      if (job.title?.toLowerCase().includes(keyword)) score += 2;
      if (job.description?.toLowerCase().includes(keyword)) score += 1;
    });

    return score;
  };

  /* ---------------- BEST MATCHES ---------------- */
  const bestMatchedJobs = jobs
    .map((job) => ({
      ...job,
      matchScore: getMatchScore(job, requirements),
    }))
    .filter((job) => job.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  /* ---------------- DATE HELPER ---------------- */
  const getDaysAgo = (date) => {
    const diff = new Date() - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <TopNavbar />

      <Container className="my-4">
        {/* ---------------- SEARCH ---------------- */}
        <Row className="mb-3">
          <Col md={6}>
            <InputGroup className="shadow-sm">
              <InputGroup.Text className="bg-white border-0">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by job title, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0"
              />
            </InputGroup>
          </Col>
        </Row>

        {/* ---------------- TABS ---------------- */}
        <div className="d-flex gap-2 mb-4">
          <Button
            variant={activeTab === "recent" ? "info" : "outline-info"}
            className="rounded-pill px-4"
            onClick={() => setActiveTab("recent")}
          >
            Most Recent
          </Button>
          <Button
            variant={activeTab === "best" ? "info" : "outline-info"}
            className="rounded-pill px-4"
            onClick={() => setActiveTab("best")}
          >
            Best Matches
          </Button>
        </div>

        {/* ---------------- BEST MATCH INPUT ---------------- */}
        {activeTab === "best" && (
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Custom Job Requirements
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Example: plumber with old piping experience, eco-friendly products"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Separate keywords with commas for accurate matching
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        )}

        {/* ---------------- LOADING ---------------- */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" />
          </div>
        ) : (
          <div>
            {(activeTab === "recent" ? sortedJobs : bestMatchedJobs).map(
              (job, index) => (
                <Card
                  key={job.id}
                  className="mb-4 border-0 shadow-sm hover-lift"
                >
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="fw-bold text-info">
                          {job.title}
                          {activeTab === "best" && (
                            <Badge bg="info" className="ms-2">
                              Match {job.matchScore}
                            </Badge>
                          )}
                        </h5>
                        <p className="text-muted">{job.description}</p>
                      </div>
                      <Badge style={{height:"25px" , width:"80px", textAlign:"center"}} bg="success">Open</Badge>
                    </div>

                    <Badge bg="light" text="dark" className="mb-2">
                      <FaBriefcase className="me-1" />
                      {job.category?.category}
                    </Badge>

                    <div className="d-flex justify-content-between mt-3">
                      <small className="text-muted">
                        <FaMapMarkerAlt className="me-1" />
                        {job.location}
                      </small>
                      <small className="text-muted">
                        <FaRegCalendarAlt className="me-1" />
                        {getDaysAgo(job.postedDate)}
                      </small>
                      <Button
                        size="sm"
                        variant="info"
                        onClick={() => {
                          setSelectedJob(job);
                          setShowModal(true);
                        }}
                      >
                        View Details →
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )
            )}
          </div>
        )}
      </Container>

      <Footer />

      {/* ---------------- MODAL ---------------- */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedJob?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{selectedJob?.description}</p>
          <p>
            <FaUser /> {selectedJob?.customerName}
          </p>
          <p>
            <FaPhone /> {selectedJob?.customerPhone}
          </p>
          <p>
            <FaHome /> {selectedJob?.customerAddress}
          </p>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CustomerJobs;
