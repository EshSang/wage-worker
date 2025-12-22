import React, { useState } from "react";
import { Navbar, Nav, Container, Form } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProfileModal from "./ProfileModal";

export default function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const { selectedType: stateSelectedType } = location.state || {};

  const normalizeRole = (r) => {
    if (!r) return r;
    const s = r.toString().toLowerCase();
    if (s === 'admin') return 'Admin';
    if (s === 'reviewer') return 'Reviewer';
    if (s === 'worker') return 'Worker';
    if (s === 'customer') return 'Customer';
    return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
  };

  /* =====================================================
     ROLE BASED NAV CONFIG
  ===================================================== */
  const ROLE_NAV_CONFIG = {
    Customer: {
      home: "/customerjobs",
      links: [
        { path: "/customerjobs", label: "Hire" },
        { path: "/customerjobpost", label: "Job Post" },
        { path: "/customerorders", label: "Orders" },
        { path: "/customerpostedjobs", label: "Posted Jobs" },
        { path: "/customerreviews", label: "Reviews" },
        { path: "/customeranalytics", label: "Analytics" },
      ],
    },

    Worker: {
      home: "/workerjob",
      links: [
        { path: "/workerjob", label: "Find" },
        { path: "/workerorders", label: "Orders" },
        { path: "/workerearning", label: "Earning" },
        { path: "/workerreviews", label: "Reviews" },
        { path: "/workeranalytics", label: "Analytics" },
      ],
    },

    Admin: {
      home: "/admin/dashboard",
      links: [
        { path: "/admin/dashboard", label: "Dashboard" },
        { path: "/admin/jobs", label: "Jobs" },
        // { path: "/admin/orders", label: "Orders" },
        { path: "/admin/earnings", label: "Earnings" },
        { path: "/admin/reports", label: "Reports" },
        { path: "/admin/settings", label: "Settings" },
      ],
    },

    Reviewer: {
      home: "/reviewer/dashboard",
      links: [
        { path: "/reviewer/dashboard", label: "Dashboard" },
        { path: "/reviewer/jobs", label: "Jobs" },
        { path: "/reviewer/reviews", label: "Review Requests" },
        // { path: "/reviewer/history", label: "History" },
        { path: "/reviewer/reports", label: "Reports" },
      ],
    },
  };

  /* =====================================================
     DETERMINE USER ROLE
  ===================================================== */
  let userRole;

  if (stateSelectedType) {
    userRole = normalizeRole(stateSelectedType);
    sessionStorage.setItem("selectedType", userRole);
  } else {
    const storedRole = sessionStorage.getItem("selectedType");
    if (storedRole) {
      userRole = normalizeRole(storedRole);
    } else {
      const path = location.pathname;
      if (path.startsWith("/worker")) userRole = "Worker";
      else if (path.startsWith("/admin")) userRole = "Admin";
      else if (path.startsWith("/reviewer")) userRole = "Reviewer";
      else userRole = "Customer";

      sessionStorage.setItem("selectedType", userRole);
    }
  }

  const navLinks = ROLE_NAV_CONFIG[userRole]?.links || [];

  /* =====================================================
     ROLE TOGGLE (ONLY CUSTOMER <-> WORKER)
  ===================================================== */
  const showRoleToggle = userRole === "Customer" || userRole === "Worker";

  const handleRoleToggle = (e) => {
    const newRole = e.target.checked ? "Worker" : "Customer";
    sessionStorage.setItem("selectedType", newRole);

    navigate(ROLE_NAV_CONFIG[newRole].home, {
      state: { selectedType: newRole },
    });
  };

  /* =====================================================
     JSX
  ===================================================== */
  return (
    <div className="pb-5">
      <Navbar
        bg="white"
        expand="lg"
        className="shadow-sm px-4 w-100 position-fixed top-0"
        style={{ zIndex: 1000 }}
      >
        <Container fluid>
          <Navbar.Toggle aria-controls="role-navbar" />

          <Navbar.Collapse id="role-navbar">
            {/* LEFT NAV LINKS */}
            <Nav className="me-auto ms-2">
              {navLinks.map((link) => (
                <Nav.Link
                  key={link.path}
                  as={Link}
                  to={link.path}
                  className={`fw-semibold ${
                    location.pathname === link.path
                      ? "text-info border-bottom border-info"
                      : "text-dark"
                  }`}
                >
                  {link.label}
                </Nav.Link>
              ))}
            </Nav>

            {/* RIGHT SECTION */}
            <div className="ms-auto d-flex align-items-center gap-3 mt-2 mt-lg-0">
              {/* ROLE TOGGLE */}
              {showRoleToggle && (
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted">Customer</span>
                  <Form.Check
                    type="switch"
                    id="role-toggle"
                    checked={userRole === "Worker"}
                    onChange={handleRoleToggle}
                    style={{ transform: "scale(1.2)" }}
                  />
                  <span className="small text-muted">Worker</span>
                </div>
              )}

              {/* PROFILE */}
              <div className="d-flex align-items-center">
                <span className="me-2 small text-muted">Hello,</span>
                <span className="fw-medium me-3">Eshana Sangeeth</span>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="bg-transparent border-0 p-0"
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

      {/* PROFILE MODAL */}
      <ProfileModal
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
      />
    </div>
  );
}
