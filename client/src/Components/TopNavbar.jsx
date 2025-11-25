import React, { useState } from "react";
import { Navbar, Nav, Container, Form } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProfileModal from "./ProfileModal";



export default function TopNavbar() {

    const location = useLocation();
    const { selectedType: stateSelectedType } = location.state || {}; // Access passed value

    const navigate = useNavigate();
    const [showProfileModal, setShowProfileModal] = useState(false);
    
    // Get selectedType from state, sessionStorage, or infer from URL path
    let userRole;
    if (stateSelectedType) {
        // If state has it, use it and save to sessionStorage
        userRole = stateSelectedType;
        sessionStorage.setItem("selectedType", stateSelectedType);
    } else {
        // Try to get from sessionStorage
        const storedType = sessionStorage.getItem("selectedType");
        if (storedType) {
            userRole = storedType;
        } else {
            // Infer from URL path as fallback
            const path = location.pathname;
            if (path.startsWith("/worker")) {
                userRole = "Worker";
                sessionStorage.setItem("selectedType", "Worker");
            } else if (path.startsWith("/customer")) {
                userRole = "Customer";
                sessionStorage.setItem("selectedType", "Customer");
            } else {
                // Default to Customer if path doesn't match
                userRole = "Customer";
            }
        }
    }
    
    console.log("Selected Type in Navbar:", userRole);

    // Worker navigation links
    const workerLinks = [
        { path: "/workerjob", label: "Find" },
        // { path: "/workermyservice", label: "My Services" },
        { path: "/workerorders", label: "Orders" },
        { path: "/workerearning", label: "Earning" },
        { path: "/workerreviews", label: "Reviews" },
        { path: "/workeranalytics", label: "Analytics" },
    ];

    // Customer navigation links
    const customerLinks = [
        { path: "/customerjobs", label: "Hire" },
        { path: "/customerjobpost", label: "Job Post" },
        { path: "/customerorders", label: "Orders" },
        { path: "/customerpostedjobs", label: "Posted Jobs" },
        { path: "/customerreviews", label: "Reviews" },
        { path: "/customeranalytics", label: "Analytics" },
    ];

    // Choose links based on role
    const navLinks = userRole === "Worker" ? workerLinks : customerLinks;

    // Handle role toggle
    const handleRoleToggle = (e) => {
        const isWorker = e.target.checked;
        const newRole = isWorker ? "Worker" : "Customer";

        // Update sessionStorage
        sessionStorage.setItem("selectedType", newRole);

        // Navigate to the appropriate home page
        if (isWorker) {
            navigate("/workerjob", { state: { selectedType: "Worker" } });
        } else {
            navigate("/customerjobs", { state: { selectedType: "Customer" } });
        }
    };

    const handleUserProfileClick = () => {
    navigate("profile");
  };

    return (
        <div className="pb-5">
            <Navbar
                bg="white"
                expand="lg"
                className="shadow-sm px-4 w-100 postion-fixed-top"
                style={{ zIndex: 1000 }}
            >
                <Container fluid>
                    <Navbar.Toggle aria-controls="role-navbar" />
                    <Navbar.Collapse id="role-navbar">
                        <Nav className="me-auto ms-2">
                            {navLinks.map((link) => (
                                <Nav.Link
                                    key={link.path}
                                    as={Link}
                                    to={link.path}
                                    className={`fw-semibold ${location.pathname === link.path
                                            ? "text-info border-bottom border-info"
                                            : "text-dark"
                                        }`}
                                >
                                    {link.label}
                                </Nav.Link>
                            ))}
                        </Nav>

                        {/* Role Toggle and Profile Section */}
                        <div className="ms-auto d-flex align-items-center gap-3 mt-2 mt-lg-0">
                            {/* Role Toggle Switch */}
                            <div className="d-flex align-items-center gap-2">
                                <span className="small text-muted">Customer</span>
                                <Form.Check
                                    type="switch"
                                    id="role-toggle"
                                    checked={userRole === "Worker"}
                                    onChange={handleRoleToggle}
                                    style={{
                                        transform: "scale(1.2)",
                                        cursor: "pointer"
                                    }}
                                />
                                <span className="small text-muted">Worker</span>
                            </div>

                            {/* Profile Section */}
                            <div className="d-flex align-items-center">
                                <span className="me-2 small text-muted">Hello,</span>
                                <span className="fw-medium me-3">Eshana Sangeeth</span>
                                <button
                                    onClick={() => setShowProfileModal(true)}
                                    className="cursor-pointer bg-transparent border-0 p-0"
                                    style={{ cursor: "pointer" }}
                                >
                                    <img
                                        src="/Profile.png"
                                        alt="Profile"
                                        className="rounded-circle border border-info"
                                        width="40"
                                        height="40"
                                        style={{ objectFit: "cover" }}
                                    />
                                </button>
                            </div>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Profile Modal */}
            <ProfileModal
                show={showProfileModal}
                onHide={() => setShowProfileModal(false)}
            />
        </div>
    )
}
