import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Card, Button, Form, Badge, ListGroup, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaUser, FaEdit, FaSignOutAlt, FaCamera, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axios";

export default function ProfileModal({ show, onHide }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    skill: "",
    about: "",
    role: "",
    avatar: "https://cdn-icons-png.flaticon.com/512/4140/4140037.png",
  });

  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (show) {
      fetchUserProfile();
    }
  }, [show]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/auth/profile');
      const userData = res.data.user;
      setProfile({
        name: `${userData.fname} ${userData.lname}`,
        email: userData.email,
        phone: userData.phonenumber || "",
        address: userData.address || "",
        skill: userData.skills || "",
        about: userData.about || "",
        role: sessionStorage.getItem("selectedType") || "",
        avatar: "https://cdn-icons-png.flaticon.com/512/4140/4140037.png",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, avatar: URL.createObjectURL(file) });
    }
  };

  const handleSave = async () => {
    try {
      const updateData = {
        phonenumber: profile.phone,
        address: profile.address,
        skills: profile.skill,
        about: profile.about
      };

      console.log("Sending update data:", updateData);

      const response = await axiosInstance.put('/api/auth/profile', updateData);

      console.log("Update response:", response.data);

      setEditing(false);
      toast.success("✅ Profile Updated Successfully");
      fetchUserProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Failed to update profile");
    }
  };

  const handleLogOutClick = () => {
    logout();
    toast.success("✅ Logout Successful!");
    onHide();
    setTimeout(() => navigate("/signin"), 800);
  };

  const handleClose = () => {
    setEditing(false);
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl"
      centered
      scrollable
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">My Profile</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            {/* Header Actions */}
            <div className="d-flex justify-content-end mb-4 gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                className="fw-semibold"
                onClick={() => setEditing(true)}
              >
                <FaEdit className="me-1" /> Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="fw-semibold"
                onClick={handleLogOutClick}
              >
                <FaSignOutAlt className="me-1" /> Logout
              </Button>
            </div>

            {/* Avatar Section */}
            <div className="text-center mb-4 position-relative">
              <img
                src={profile.avatar}
                alt="Avatar"
                width={110}
                height={110}
                className="rounded-circle border shadow-sm"
                style={{ objectFit: "cover", border: "5px solid #fff" }}
              />

              {editing && (
                <label
                  htmlFor="avatarUpload"
                  className="btn btn-primary btn-sm rounded-circle shadow position-absolute"
                  style={{ bottom: "10px", left: "50%", transform: "translateX(-50%)" }}
                >
                  <FaCamera size={14} />
                </label>
              )}

              <input type="file" id="avatarUpload" hidden onChange={handleImageUpload} />
            </div>

            {/* Display / Edit Mode */}
            {!editing ? (
              <>
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Card className="p-3 border-0 shadow-sm">
                      <FaUser className="text-primary fs-4 mb-1" />
                      <h6 className="fw-bold mb-0">{profile.name}</h6>
                      <small className="text-muted">Full Name</small>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="p-3 border-0 shadow-sm">
                      <FaEnvelope className="text-danger fs-4 mb-1" />
                      <h6 className="fw-bold mb-0">{profile.email}</h6>
                      <small className="text-muted">Email</small>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="p-3 border-0 shadow-sm">
                      <FaPhone className="text-success fs-4 mb-1" />
                      <h6 className="fw-bold mb-0">{profile.phone || "Not provided"}</h6>
                      <small className="text-muted">Phone</small>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="p-3 border-0 shadow-sm">
                      <FaMapMarkerAlt className="text-warning fs-4 mb-1" />
                      <h6 className="fw-bold mb-0">{profile.address || "Not provided"}</h6>
                      <small className="text-muted">Address</small>
                    </Card>
                  </Col>
                </Row>

                {/* Skills Section */}
                <Card className="shadow-sm border-0 p-3 mb-3">
                  <h5 className="fw-bold mb-3">Skills</h5>
                  <div>
                    {profile.skill ? (
                      profile.skill.split(',').map((skill, index) => (
                        <Badge key={index} bg="primary" className="me-2 mb-2">
                          {skill.trim()}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted mb-0">No skills added yet</p>
                    )}
                  </div>
                </Card>

                {/* About My Work */}
                <Card className="shadow-sm border-0 p-3 mb-3">
                  <h5 className="fw-bold mb-3">About My Works</h5>
                  <p className="text-muted mb-0">
                    {profile.about || "No work description added yet"}
                  </p>
                </Card>

                {/* My Reviews Section */}
                <Card className="shadow-sm border-0 p-3">
                  <h5 className="fw-bold mb-3">My Reviews</h5>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="border-0 p-3 shadow-sm mb-3 rounded">
                      <strong>John Doe</strong>
                      <div className="text-warning">⭐⭐⭐⭐☆</div>
                      <p className="text-muted mb-0">Great work! Delivered on time and with high quality.</p>
                    </ListGroup.Item>

                    <ListGroup.Item className="border-0 p-3 shadow-sm mb-3 rounded">
                      <strong>Amara Silva</strong>
                      <div className="text-warning">⭐⭐⭐⭐⭐</div>
                      <p className="text-muted mb-0">Amazing UI design and clean code. Highly recommended!</p>
                    </ListGroup.Item>
                  </ListGroup>
                </Card>
              </>
            ) : (
              <Form className="mt-3">
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleInputChange}
                        disabled
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleInputChange}
                        disabled
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={profile.phone}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={profile.address}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Skills (comma separated)</Form.Label>
                      <Form.Control
                        type="text"
                        name="skill"
                        value={profile.skill}
                        onChange={handleInputChange}
                        placeholder="e.g., JavaScript, React, Node.js"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>About My Work</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="about"
                        value={profile.about}
                        onChange={handleInputChange}
                        placeholder="Tell us about your work experience and expertise..."
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-4 text-end">
                  <Button variant="success" className="me-2 fw-semibold" onClick={handleSave}>
                    Save
                  </Button>
                  <Button variant="secondary" className="fw-semibold" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </Form>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
