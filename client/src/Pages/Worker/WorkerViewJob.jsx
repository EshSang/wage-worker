import React, { useState } from "react";
import { FaArrowLeft, FaMapMarkerAlt, FaRegCalendarAlt, FaBriefcase, FaUser } from "react-icons/fa";
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Modal, Container, Card, Badge } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopNavbar from "../../Components/TopNavbar";
import Footer from "../../Components/Footer";
import axiosInstance from "../../api/axios";
import './WorkerViewJob.css';

export default function WorkerViewJob() {

    const navigate = useNavigate();

    const handleBackWorkerJob = () => {
        navigate("/workerjob");
    }

    const { state } = useLocation();
    const job = state;
    console.log("Job details:", job);

    // Get logged-in user email
    const loggedUserEmail = localStorage.getItem("logginUserEmail");

    // Check if logged user is the job creator
    const isJobCreator = job?.createdUser?.email === loggedUserEmail;

    const [show, setShow] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleApplyJob = async () => {
        setSubmitting(true);
        try {
            const response = await axiosInstance.post('/api/applications', {
                jobId: job.id
            });

            console.log("Application submitted:", response.data);
            toast.success("Application submitted successfully!");
            setShow(false);

            setTimeout(() => {
                navigate("/workerorders");
            }, 2000);
        } catch (error) {
            console.error("Error submitting application:", error);
            const errorMessage = error.response?.data?.message || "Failed to submit application. Please try again.";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate days ago
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
                    {/* Back Button */}
                    <Button
                        variant="link"
                        className="text-decoration-none text-dark mb-3 p-0 back-button"
                        onClick={handleBackWorkerJob}
                    >
                        <FaArrowLeft size={18} className="me-2" />
                        Back to Jobs
                    </Button>

                    {/* Main Job Details Card */}
                    <Card className="border-0 shadow-sm mb-4 job-detail-card">
                        <Card.Body className="p-4">
                            {/* Header with Title and Status */}
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div className="flex-grow-1">
                                    <h2 className="fw-bold theme-primary mb-3">{job.title}</h2>
                                    <div className="d-flex flex-wrap gap-3 text-secondary">
                                        <span className="d-flex align-items-center">
                                            <FaMapMarkerAlt size={16} className="me-2 theme-primary" />
                                            {job.location}
                                        </span>
                                        <span className="d-flex align-items-center">
                                            <FaRegCalendarAlt size={16} className="me-2 theme-primary" />
                                            Posted {getDaysAgo(job.postedDate)}
                                        </span>
                                        <span className="d-flex align-items-center">
                                            <FaBriefcase size={16} className="me-2 theme-primary" />
                                            {job.category?.category}
                                        </span>
                                    </div>
                                </div>
                                <Badge bg="success" className="px-3 py-2 fs-6">
                                    {job.status || 'Open'}
                                </Badge>
                            </div>

                            <hr className="my-4" />

                            {/* Description Section */}
                            <div className="mb-4">
                                <h5 className="fw-bold mb-3 section-title">
                                    <span className="title-accent"></span>
                                    Job Description
                                </h5>
                                <p className="text-muted" style={{ textAlign: "justify", lineHeight: "1.8", fontSize: "1.05rem" }}>
                                    {job.description}
                                </p>
                            </div>

                            <hr className="my-4" />

                            {/* Skills Section */}
                            <div className="mb-4">
                                <h5 className="fw-bold mb-3 section-title">
                                    <span className="title-accent"></span>
                                    Required Skills
                                </h5>
                                <div className="d-flex flex-wrap gap-2">
                                    {job.skills && job.skills.split(',').map((skill, idx) => (
                                        <Badge
                                            key={idx}
                                            bg="light"
                                            text="dark"
                                            className="px-3 py-2 skill-badge"
                                            style={{ fontSize: '0.95rem' }}
                                        >
                                            {skill.trim()}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <hr className="my-4" />

                            {/* Job Creator Info */}
                            {job.createdUser && (
                                <div className="mb-4">
                                    <h5 className="fw-bold mb-3 section-title">
                                        <span className="title-accent"></span>
                                        Posted By
                                    </h5>
                                    <div className="d-flex align-items-center">
                                        <FaUser className="theme-primary me-2" size={20} />
                                        <div>
                                            <div className="fw-semibold">{job.createdUser.fname} {job.createdUser.lname}</div>
                                            <div className="small text-muted">{job.createdUser.email}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Apply Button */}
                            <div className="text-center mt-5">
                                {isJobCreator ? (
                                    <div className="alert alert-info">
                                        <FaUser className="me-2" />
                                        You cannot apply to your own job posting
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => setShow(true)}
                                        variant="info"
                                        size="lg"
                                        className="px-5 py-3 text-white apply-button"
                                    >
                                        Apply for this Job
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Application Modal */}
                    <Modal show={show} onHide={() => setShow(false)} centered className="application-modal">
                        <Modal.Header closeButton className="border-0 pb-0">
                            <Modal.Title className="theme-primary fw-bold">Confirm Application</Modal.Title>
                        </Modal.Header>

                        <Modal.Body className="text-center py-4">
                            <div className="mb-3">
                                <div className="confirmation-icon mb-3">
                                    <FaBriefcase size={40} className="theme-primary" />
                                </div>
                                <h5 className="mb-2">Apply for {job.title}?</h5>
                                <p className="text-muted">
                                    Your application will be sent to the employer. Make sure you're ready!
                                </p>
                            </div>
                        </Modal.Body>

                        <Modal.Footer className="border-0 d-flex justify-content-center gap-3 pb-4">
                            <Button
                                variant="outline-secondary"
                                style={{ width: "140px" }}
                                onClick={() => setShow(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="info"
                                className="text-white"
                                style={{ width: "140px" }}
                                onClick={handleApplyJob}
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Confirm Apply'}
                            </Button>
                        </Modal.Footer>
                    </Modal>

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
    )
}
