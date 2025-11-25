import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Badge, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaUser, FaEdit, FaSignOutAlt, FaCamera } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axios";

export default function Profile() {
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
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
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
      await axiosInstance.put('/api/auth/profile', {
        phonenumber: profile.phone,
        address: profile.address,
        skills: profile.skill,
        about: profile.about
      });
      setEditing(false);
      toast.success("✅ Profile Updated Successfully");
      fetchUserProfile(); // Refresh profile data
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleLogOutClick = () => {
    logout();
    toast.success("✅ Logout Successful!");
    setTimeout(() => navigate("/signin"), 800);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd, #ffffff)",
        padding: "30px 0",
      }}
    >
      <Container className="pb-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card
              className="p-4 shadow-lg border-0"
              style={{
                borderRadius: "22px",
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(15px)",
              }}
            >
              {/* Header */}
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h4 className="fw-bold mb-0">My Profile</h4>

                <div>
                  <Button
                    variant="outline-primary"
                    className="me-2 fw-semibold"
                    onClick={() => setEditing(true)}
                  >
                    <FaEdit className="me-1" /> Edit
                  </Button>

                  <Button variant="danger" className="fw-semibold" onClick={handleLogOutClick}>
                    <FaSignOutAlt className="me-1" /> Logout
                  </Button>
                </div>
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
                  <Row className="g-3">
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
                        <h6 className="fw-bold mb-0">{profile.phone}</h6>
                        <small className="text-muted">Phone</small>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="p-3 border-0 shadow-sm">
                        <FaMapMarkerAlt className="text-warning fs-4 mb-1" />
                        <h6 className="fw-bold mb-0">{profile.address}</h6>
                        <small className="text-muted">Address</small>
                      </Card>
                    </Col>
                  </Row>
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
            </Card>
          </Col>
        </Row>
      </Container>


      {/*     Skills Section            */}
      <div className="px-5">
        <Card className="shadow-sm border-0 p-4 mb-4 ">
          <h4 className="fw-bold mb-3">Skills</h4>
          <div>
            {profile.skill ? (
              profile.skill.split(',').map((skill, index) => (
                <Badge key={index} bg="primary" className="me-2 mb-2">
                  {skill.trim()}
                </Badge>
              ))
            ) : (
              <p className="text-muted">No skills added yet</p>
            )}
          </div>
        </Card>
      </div>


      {/*     My Work Description       */}
      <div className="px-5">
        <Card className="shadow-sm border-0 p-4 mb-4">
          <h4 className="fw-bold mb-3">About My Works</h4>
          <p className="text-muted">
            {profile.about || "No work description added yet"}
          </p>
        </Card>
      </div>       

      {/*     My Reviews Section        */}
      <div className="px-5">
        <Card className="shadow-sm border-0 p-4">
          <h4 className="fw-bold mb-3">My Reviews</h4>

          <ListGroup variant="flush">
            <ListGroup.Item className="border-0 p-3 shadow-sm mb-3 rounded">
              <strong>John Doe</strong>
              <div className="text-warning">⭐⭐⭐⭐☆</div>
              <p className="text-muted">Great work! Delivered on time and with high quality.</p>
            </ListGroup.Item>

            <ListGroup.Item className="border-0 p-3 shadow-sm mb-3 rounded">
              <strong>Amara Silva</strong>
              <div className="text-warning">⭐⭐⭐⭐⭐</div>
              <p className="text-muted">Amazing UI design and clean code. Highly recommended!</p>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </div>  

    </div>
  );
}
