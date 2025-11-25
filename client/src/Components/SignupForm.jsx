import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import axiosInstance from '../api/axios';

function SignupForm() {
  const navigate = useNavigate();
  
  const [values, setValues] = useState({
    fname: '',
    lname: '',
    phonenumber: '',
    email: '',
    password: ''
  });

  const [validated, setValidated] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    axiosInstance.post("/api/auth/signup", values)
      .then(res => {
        if (res.data === "User already exists" || res.data?.message === "User already exists") {
          setErrorMessage("⚠️ This email is already registered. Please use a different one.");
          return;
        }

        setSuccessMessage("✅ User registered successfully! Redirecting to login...");

        // Redirect to login page after successful registration
        setTimeout(() => {
          navigate("/");
        }, 2000);
      })
      .catch(err => {
        const errorMsg = err.response?.data?.message || "❌ Something went wrong. Please try again later.";
        setErrorMessage(errorMsg);
      });
  };

  return (
    <>
      <div className="mt-3 text-center" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      </div>

      <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: '88vh' }}>
        <div className="shadow rounded" style={{ width: '1050px', background: '#fff' }}>
          <div className="row g-0" style={{ height: '620px' }}>

            {/* Left Form Section */}
            <div className="col-7 d-flex flex-column justify-content-center align-items-center bg-white">
              <div className="w-100 px-5">

                <h3 className="text-center mb-3">Create Account</h3>

                <Form noValidate validated={validated} onSubmit={handleSubmit}>

                  <Form.Group className="mb-2" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <Form.Control
                      required
                      type="text"
                      name="fname"
                      placeholder="First Name"
                      value={values.fname}
                      onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">First name is required</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-2" style={{ maxWidth: '400px', margin: 'auto' }}>
                    <Form.Control
                      required
                      type="text"
                      name="lname"
                      placeholder="Last Name"
                      value={values.lname}
                      onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">Last name is required</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-2" style={{ maxWidth: '400px', margin: 'auto' }}>
                    <Form.Control
                      required
                      type="tel"
                      name="phonenumber"
                      placeholder="Phone Number"
                      value={values.phonenumber}
                      onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">Phone number is required</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-2" style={{ maxWidth: '400px', margin: 'auto' }}>
                    <Form.Control
                      required
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={values.email}
                      onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">Valid email is required</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" style={{ maxWidth: '400px', margin: 'auto' }}>
                    <Form.Control
                      required
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={values.password}
                      onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">Password is required</Form.Control.Feedback>
                  </Form.Group>

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
                      Sign Up
                    </button>
                  </div>

                   {/* Divider */}
                  <div className="d-flex align-items-center my-4" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <hr className="flex-grow-1" />
                    <span className="px-2 text-muted" style={{ fontSize: "12px" }}>Or</span>
                    <hr className="flex-grow-1" />
                  </div>
                  {/* Google Sign in button */}
                  <div className="d-flex justify-content-center mb-2">
                    <button
                      type="button"
                      className="btn rounded-pill d-flex align-items-center justify-content-center"
                      style={{
                        width: '300px',
                        backgroundColor: '#fff',
                        color: '#0FC5BB',
                        borderColor: '#0FC5BB',
                        borderWidth: '1px',
                        fontWeight: 500
                      }}
                    >
                      <img
                        src="/public/Google Icon.png"
                        alt="Google"
                        className="me-2"
                        style={{ width: '24px', height: '24px' }}
                      />
                      Sign In with Google
                    </button>
                  </div>

                  <div className="text-center mt-3" style={{ fontSize: '14px' }}>
                    Already have an account?{' '}
                    <button onClick={() => navigate("/")} type="button" className="btn p-0" style={{ color: '#0FC5BB', fontWeight: 500, fontSize: '12px' }}>
                      Sign In
                    </button>
                  </div>
                </Form>
              </div>
            </div>

            {/* Right Side */}
            <div className="col-5 d-flex flex-column justify-content-center align-items-center"
              style={{ background: '#0FC5BB', color: '#fff', borderRadius: '0 10px 10px 0' }}>
              <h2>Welcome Folks</h2>
              <p>Enter your personal details and start your journey with us</p>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SignupForm;
