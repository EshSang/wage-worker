import React from 'react';
import { useNavigate } from "react-router-dom";
import { FaUserTie, FaBriefcase } from 'react-icons/fa';
import './Home.css';

export default function Home() {

  const navigate = useNavigate();

  const handleWorkerJobClick = (type) => {
    sessionStorage.setItem("selectedType", type);
    navigate("/workerjob", { state: { selectedType: type }});
  };

  const handleCustomerJobClick = (type) => {
    sessionStorage.setItem("selectedType", type);
    navigate("/customerjobs", { state: { selectedType: type }});
  };

  return (
      <div>
      <div className="d-flex flex-column min-vh-100 bg-light">
        {/* Navbar */}
        <nav className="navbar bg-white shadow-sm px-4 py-3 d-flex justify-content-between align-items-center">
          <h5 className="m-0 fw-bold theme-primary">Wage Worker Management System</h5>
          <div className="d-flex align-items-center">
            <span className="me-2 small text-muted">Hello,</span>
            <span className="fw-medium me-3">Eshana Sangeeth</span>
            <img
              src="/public/Profile.png"
              alt="Profile"
              className="rounded-circle border-2"
              style={{ border: '2px solid #0dcaf0' }}
              width="40"
              height="40"
            />
          </div>
        </nav>

        {/* Main Content */}
        <div className="container flex-grow-1 d-flex justify-content-center align-items-center">
          <div className="card shadow-lg border-0 p-5 text-center home-card" style={{ maxWidth: "750px", width: "100%", borderRadius: "20px" }}>
            <h2 className="fw-bold mb-3">Select Your Type</h2>
            <p className="text-muted mb-5 lead">
              Join as a worker or hire a worker—pick the option that suits you best!
            </p>

            <div className="d-flex justify-content-center gap-4">
              {/* Worker Card */}
              <div
                className="selection-card worker-card"
                onClick={() => handleWorkerJobClick("Worker")}
              >
                <div className="icon-circle mb-3">
                  <FaBriefcase size={40} />
                </div>
                <h5 className="fw-bold mb-2">Worker</h5>
                <p className="text-muted small">Find jobs and opportunities</p>
              </div>

              {/* Customer Card */}
              <div
                className="selection-card customer-card"
                onClick={() => handleCustomerJobClick("Customer")}
              >
                <div className="icon-circle mb-3">
                  <FaUserTie size={40} />
                </div>
                <h5 className="fw-bold mb-2">Customer</h5>
                <p className="text-muted small">Post jobs and hire workers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

