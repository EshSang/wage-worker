import React, { useState } from "react";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

function SigninForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    console.log("🔵 handleLogin called");
    e.preventDefault();
    e.stopPropagation();
    console.log("🔵 Event prevented");

    // const form = e.target;

    // ✅ Toast + empty field checks
    if (!email.trim()) {
      console.log("❌ Email is empty");
      toast.error("Email is required");
      setValidated(true);
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      console.log("❌ Email format invalid");
      toast.error("Invalid email format");
      setValidated(true);
      return;
    }
    if (!password.trim()) {
      console.log("❌ Password is empty");
      toast.error("Password is required");
      setValidated(true);
      return;
    }
    if (password.length < 6) {
      console.log("❌ Password too short");
      toast.error("Password must be at least 6 characters");
      setValidated(true);
      return;
    }

    console.log("✅ Validation passed, sending request...");

    try {
      console.log("📤 Sending login request to:", "/signin");
      const res = await axiosInstance.post("/signin", { email, password });
      console.log("✅ Login response:", res.data);

      // Save logged-in user email and data in local storage
      localStorage.setItem("logginUserEmail", res.data.user.email);

      toast.success("✅ Login Success!");
      login(res.data.token);

      // All users navigate to home page
      navigate("/home");
    } catch (err) {
      console.error("❌ Login error:", err);
      console.error("❌ Error response:", err.response?.data);
      toast.error(err.response?.data?.message || "❌ Login Failed");
    }
  };

  return (
    <>
      <ToastContainer />

      <div
        className="d-flex justify-content-center align-items-center bg-light"
        style={{ minHeight: "88vh" }}
      >
        <div
          className="shadow rounded"
          style={{ width: "1050px", background: "#fff" }}
        >
          <div
            className="row g-0"
            style={{ height: "600px", display: "flex", flexWrap: "nowrap" }}
          >
            {/* Left: Form */}
            <div
              className="col-7 d-flex flex-column justify-content-center align-items-center"
              style={{
                background: "#fff",
                borderTopLeftRadius: "10px",
                borderBottomLeftRadius: "10px",
                height: "600px",
              }}
            >
              <div className="w-100 px-5">
                <div
                  className="text-center fs-3 mb-2"
                  style={{ width: "100%", marginTop: "20px" }}
                >
                  Sign in to your Account
                </div>

                {/* Form with bootstrap validation */}
                <form
                  noValidate
                  className={validated ? "was-validated" : "mx-auto"}
                  onSubmit={handleLogin}
                >
                  {/* Email input */}
                  <div
                    className="mb-2"
                    style={{ maxWidth: "400px", margin: "0 auto" }}
                  >
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: "100%", margin: "0 auto" }}
                    />
                    <div className="invalid-feedback">
                      Please enter a valid email.
                    </div>
                  </div>

                  {/* Password input */}
                  <div
                    className="mb-2"
                    style={{ maxWidth: "400px", margin: "0 auto" }}
                  >
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: "100%", margin: "0 auto" }}
                    />
                    <div className="invalid-feedback">
                      Password must be at least 6 characters.
                    </div>
                  </div>

                  {/* Forgot Password */}
                  <div
                    className="d-flex justify-content-end"
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      margin: "0 auto",
                    }}
                  >
                    <small className="text-muted" style={{ cursor: "pointer" }}>
                      Forgot Password?
                    </small>
                  </div>

                  {/* Submit */}
                  <div className="d-flex justify-content-center mt-4">
                    <button
                      type="submit"
                      className="btn rounded-pill"
                      style={{
                        width: "300px",
                        backgroundColor: "#0FC5BB",
                        borderColor: "#0FC5BB",
                        color: "#fff",
                        fontWeight: 500,
                      }}
                    >
                      Sign In
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <div
                  className="d-flex align-items-center my-4"
                  style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}
                >
                  <hr className="flex-grow-1" />
                  <span
                    className="px-2 text-muted"
                    style={{ fontSize: "12px" }}
                  >
                    Or
                  </span>
                  <hr className="flex-grow-1" />
                </div>

                {/* Google */}
                <div className="d-flex justify-content-center mb-2">
                  <button
                    type="button"
                    className="btn rounded-pill d-flex align-items-center justify-content-center"
                    style={{
                      width: "300px",
                      backgroundColor: "#fff",
                      color: "#0FC5BB",
                      borderColor: "#0FC5BB",
                      borderWidth: "1px",
                      fontWeight: 500,
                    }}
                  >
                    <img
                      src="/public/Google Icon.png"
                      className="me-2"
                      style={{ width: "24px", height: "24px" }}
                      alt="Google"
                    />
                    Sign In with Google
                  </button>
                </div>

                {/* Signup redirect */}
                <div className="text-center mt-3" style={{ fontSize: "14px" }}>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="btn p-0"
                    style={{
                      color: "#0FC5BB",
                      fontWeight: 500,
                      fontSize: "12px",
                    }}
                    onClick={() => navigate("/signup")}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div
              className="col-5 d-flex flex-column justify-content-center align-items-center"
              style={{
                background: "#0FC5BB",
                borderTopRightRadius: "10px",
                borderBottomRightRadius: "10px",
                color: "#fff",
                height: "600px",
              }}
            >
              <div className="text-center px-4 w-100">
                <div className="h2 mb-3" style={{ fontWeight: 700 }}>
                  Welcome folks
                </div>
                <div style={{ fontSize: "18px", fontWeight: 400 }}>
                  To keep connected with us
                  <br />
                  please login your personal info
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SigninForm;
