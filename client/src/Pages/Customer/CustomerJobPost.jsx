import React, { useState, useEffect } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopNavbar from '../../Components/TopNavbar';
import Footer from "../../Components/Footer";
import axiosInstance from '../../api/axios';

export default function CustomerJobPost() {

  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const getLoginEmail = localStorage.getItem("logginUserEmail");

  const [formData, setformData] = useState({
    title: "",
    location: "",
    description: "",
    skills: "",
    postedDate: "",
    categoryId: "",
    hourlyRate: "",
  });

  const [errors, setErrors] = useState({});


  //VALIDATION FUNCTION
  
  const validateForm = () => {
    let formErrors = {};

    if (!formData.title.trim()) {
      formErrors.title = "Job title is required.";
    }

    if (!formData.location.trim()) {
      formErrors.location = "Job location is required.";
    }

    if (!formData.categoryId) {
      formErrors.categoryId = "Please select a category.";
    }

    if (!formData.hourlyRate || formData.hourlyRate <= 0) {
      formErrors.hourlyRate = "Hourly rate must be greater than 0.";
    }

    if (!formData.description.trim()) {
      formErrors.description = "Job description is required.";
    }

    if (!formData.skills.trim()) {
      formErrors.skills = "Skills are required.";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);

    if (!validateForm()) {
      return;
    }

    axiosInstance.post("/api/jobs", formData)
      .then(res => {
        if (res.data === "This record already exists" || res.data?.message === "This record already exists") {
          setErrorMessage("⚠️ This record is already there. Please use a different one.");
          toast.error("⚠️ This record already exists!");
          return;
        }

        setSuccessMessage("✅ Submitted successfully!");
        toast.success("✅ Submitted successfully!");

        setformData({
          title: "",
          location: "",
          description: "",
          skills: "",
          postedDate: "",
          categoryId: "",
          hourlyRate: "",
        });

        setTimeout(() => navigate("/customerjobs"), 2000);
      })
      .catch(() => {
        setErrorMessage("❌ Something went wrong. Please try again later.");
        toast.error("❌ Something went wrong. Please try again later.");
      });
  };

  // Display today's date
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setformData((prevData) => ({
      ...prevData,
      postedDate: formattedDate,
    }));
  }, []);

  // Load categories
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let isMounted = true;
    axiosInstance.get("/api/categories")
      .then((res) => {
        if (!isMounted) return;
        const payload = res.data.categories || res.data;
        setCategories(Array.isArray(payload) ? payload : []);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load categories:", err);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <>
      <TopNavbar />

      <div>
        <Container>
          <h3>Add Job Details</h3>
          <hr />

          {/* ================================
              ENABLE BOOTSTRAP VALIDATION
              ================================= */}
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter job title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => {
                      setformData({ ...formData, title: e.target.value });
                      if (errors.title) {
                        setErrors({ ...errors, title: "" });
                      }
                    }}
                    isInvalid={!!errors.title}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Location</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter job location"
                    name="location"
                    value={formData.location}
                    onChange={(e) => {
                      setformData({ ...formData, location: e.target.value });
                      if (errors.location) {
                        setErrors({ ...errors, location: "" });
                      }
                    }}
                    isInvalid={!!errors.location}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.location}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="categoryId"
                value={formData.categoryId}
                onChange={(e) => {
                  setformData({ ...formData, categoryId: e.target.value });
                  if (errors.categoryId) {
                    setErrors({ ...errors, categoryId: "" });
                  }
                }}
                isInvalid={!!errors.categoryId}
                required
              >
                <option value="">-- Select Category --</option>

                {categories.map((cat) => {
                  const key = cat.id ?? cat._id ?? JSON.stringify(cat);
                  const value = cat.id ?? "";
                  const label = cat.category ?? cat.name ?? value;
                  return (
                    <option key={key} value={value}>
                      {label}
                    </option>
                  );
                })}
              </Form.Select>

              <Form.Control.Feedback type="invalid">
                {errors.categoryId}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hourly Rate (LKR)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter hourly rate"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9]/g, "");
                  setformData({ ...formData, hourlyRate: numericValue });

                  if (errors.hourlyRate) {
                    setErrors({ ...errors, hourlyRate: "" });
                  }
                }}
                isInvalid={!!errors.hourlyRate}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.hourlyRate}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Job Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter job description"
                name="description"
                value={formData.description}
                onChange={(e) => {
                  setformData({ ...formData, description: e.target.value });
                  if (errors.description) {
                    setErrors({ ...errors, description: "" });
                  }
                }}
                isInvalid={!!errors.description}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Skills</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter required skills"
                    name="skills"
                    value={formData.skills}
                    onChange={(e) => {
                      setformData({ ...formData, skills: e.target.value });
                      if (errors.skills) {
                        setErrors({ ...errors, skills: "" });
                      }
                    }}
                    isInvalid={!!errors.skills}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.skills}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Posted Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="postedDate"
                    value={formData.postedDate}
                    disabled
                    isInvalid={!!errors.postedDate}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.postedDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="text-center mb-5 pb-5">
              <Button variant="primary" type="submit" className="px-5">
                Submit
              </Button>
            </div>
          </Form>
        </Container>

        <Footer />
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </>
  );
}
