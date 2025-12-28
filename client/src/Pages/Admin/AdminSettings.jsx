import "./AdminSettings.css";
import React, { useState, useEffect } from "react";
import {
  Container,
  Tabs,
  Tab,
  Card,
  Table,
  Badge,
  Button,
  Form,
  Modal,
  Row,
  Col,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { Search, Eye, Edit, Trash2, UserPlus } from "lucide-react";
import TopNavbar from "../../Components/TopNavbar";
import Footer from "../../Components/Footer";
import axiosInstance from "../../api/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminSettings() {
  const [activeKey, setActiveKey] = useState("users");

  // User Management State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  // Modal States
  const [showUserModal, setShowUserModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fname: "",
    lname: "",
    phonenumber: "",
    address: "",
    skills: "",
    about: "",
    usertype: "USER",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Category Management State
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

  useEffect(() => {
    if (activeKey === "users") {
      fetchUsers();
    } else if (activeKey === "services") {
      fetchCategories();
    }
  }, [activeKey, searchTerm, filterType, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== "ALL") params.append("usertype", filterType);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", pagination.currentPage);
      params.append("limit", 20);

      const response = await axiosInstance.get(`/api/admin/users?${params.toString()}`);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response?.status === 403) {
        toast.error("Access denied. Admin privileges required.");
      } else {
        toast.error("Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setModalMode("create");
    setSelectedUser(null);
    setFormData({
      email: "",
      password: "",
      fname: "",
      lname: "",
      phonenumber: "",
      address: "",
      skills: "",
      about: "",
      usertype: "USER",
    });
    setFormErrors({});
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      email: user.email || "",
      password: "",
      fname: user.fname || "",
      lname: user.lname || "",
      phonenumber: user.phonenumber || "",
      address: user.address || "",
      skills: user.skills || "",
      about: user.about || "",
      usertype: user.usertype || "USER",
    });
    setFormErrors({});
    setShowUserModal(true);
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/admin/users/${userId}`);
      setSelectedUser(response.data.data);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user details");
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await axiosInstance.delete(`/api/admin/users/${selectedUser.id}`);
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (modalMode === "create" && !formData.password) {
      errors.password = "Password is required";
    }

    if (modalMode === "create" && formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.fname) {
      errors.fname = "First name is required";
    }

    if (!formData.lname) {
      errors.lname = "Last name is required";
    }

    if (formData.phonenumber && !/^[0-9]{10}$/.test(formData.phonenumber.replace(/\s/g, ""))) {
      errors.phonenumber = "Phone number must be 10 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const submitData = { ...formData };
      if (modalMode === "edit" && !submitData.password) {
        delete submitData.password;
      }

      if (modalMode === "create") {
        await axiosInstance.post("/api/admin/users", submitData);
        toast.success("User created successfully");
      } else {
        await axiosInstance.put(`/api/admin/users/${selectedUser.id}`, submitData);
        toast.success("User updated successfully");
      }

      setShowUserModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      const errorMessage = error.response?.data?.message || "Failed to save user";
      toast.error(errorMessage);

      if (errorMessage.includes("Email")) {
        setFormErrors({ email: errorMessage });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getUserTypeBadge = (usertype) => {
    const variants = {
      USER: "info",
      ADMIN: "dark",
      REVIEWER: "warning",
      CUSTOMER: "success",
    };
    return variants[usertype] || "secondary";
  };

  const getUserTypeLabel = (usertype) => {
    const labels = {
      USER: "Worker",
      ADMIN: "Admin",
      REVIEWER: "Reviewer",
      CUSTOMER: "Customer",
    };
    return labels[usertype] || usertype;
  };

  // ============= CATEGORY MANAGEMENT FUNCTIONS =============

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);
      const response = await axiosInstance.get("/api/categories");
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (error.response?.status === 403) {
        toast.error("Access denied. Admin privileges required.");
      } else {
        toast.error("Failed to load categories");
      }
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!categoryInput.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        await axiosInstance.put(`/api/categories/${editingCategory.id}`, {
          category: categoryInput.trim(),
        });
        toast.success("Category updated successfully");
        setEditingCategory(null);
      } else {
        // Create new category
        await axiosInstance.post("/api/categories", {
          category: categoryInput.trim(),
        });
        toast.success("Category added successfully");
      }

      setCategoryInput("");
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      const errorMessage = error.response?.data?.message || "Failed to save category";
      toast.error(errorMessage);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryInput(category.category);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryInput("");
  };

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setShowDeleteCategoryModal(true);
  };

  const confirmDeleteCategory = async () => {
    try {
      setDeletingCategory(true);
      await axiosInstance.delete(`/api/categories/${selectedCategory.id}`);
      toast.success("Category deleted successfully");
      setShowDeleteCategoryModal(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    } finally {
      setDeletingCategory(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <TopNavbar />
      <Container fluid className="bg-light min-vh-100 p-4">
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <h4 className="fw-bold mb-4">Settings</h4>

            <Tabs
              activeKey={activeKey}
              onSelect={(k) => setActiveKey(k)}
              className="mb-4"
              justify
            >
              {/* ================= USER MANAGEMENT TAB ================= */}
              <Tab eventKey="users" title="👤 User Management">
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    {/* Header with Search and Add Button */}
                    <Row className="mb-3 g-3 align-items-center">
                      <Col md={4}>
                        <Form.Select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        >
                          <option value="ALL">All Users</option>
                          <option value="USER">Workers</option>
                          <option value="ADMIN">Administrators</option>
                          <option value="REVIEWER">Reviewers</option>
                        </Form.Select>
                      </Col>
                      <Col md={5}>
                        <InputGroup>
                          <InputGroup.Text className="bg-white">
                            <Search size={16} />
                          </InputGroup.Text>
                          <Form.Control
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </InputGroup>
                      </Col>
                      <Col md={3} className="text-end">
                        <Button variant="primary" size="sm" onClick={handleAddUser}>
                          <UserPlus size={16} className="me-1" />
                          Add User
                        </Button>
                      </Col>
                    </Row>

                    {loading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-muted mt-2">Loading users...</p>
                      </div>
                    ) : (
                      <>
                        <div className="table-responsive">
                          <Table hover className="align-middle">
                            <thead className="table-light">
                              <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th className="text-end">Actions</th>
                              </tr>
                            </thead>

                            <tbody>
                              {users.length > 0 ? (
                                users.map((user) => (
                                  <tr key={user.id}>
                                    <td className="fw-semibold">#{user.id}</td>
                                    <td>
                                      {user.fname} {user.lname}
                                    </td>
                                    <td className="text-muted">{user.email}</td>
                                    <td className="text-muted">{user.phonenumber || "N/A"}</td>
                                    <td>
                                      <Badge bg={getUserTypeBadge(user.usertype)}>
                                        {getUserTypeLabel(user.usertype)}
                                      </Badge>
                                    </td>
                                    <td className="text-end">
                                      <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleViewUser(user.id)}
                                      >
                                        <Eye size={14} />
                                      </Button>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEditUser(user)}
                                      >
                                        <Edit size={14} />
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteUser(user)}
                                      >
                                        <Trash2 size={14} />
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="6" className="text-center text-muted py-4">
                                    No users found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                            <small className="text-muted">
                              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} users)
                            </small>
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                disabled={pagination.currentPage === 1}
                                onClick={() =>
                                  setPagination((prev) => ({
                                    ...prev,
                                    currentPage: prev.currentPage - 1,
                                  }))
                                }
                              >
                                Previous
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                disabled={pagination.currentPage === pagination.totalPages}
                                onClick={() =>
                                  setPagination((prev) => ({
                                    ...prev,
                                    currentPage: prev.currentPage + 1,
                                  }))
                                }
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Tab>

              {/* ================= SERVICE CATEGORY TAB ================= */}
              <Tab eventKey="services" title="🛠 Service Category Management">
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <h5 className="fw-bold mb-3">Service Categories</h5>

                    <Form onSubmit={handleAddCategory} className="d-flex gap-2 mb-4">
                      <Form.Control
                        type="text"
                        placeholder="Enter service category (e.g., Plumbing)"
                        value={categoryInput}
                        onChange={(e) => setCategoryInput(e.target.value)}
                      />
                      {editingCategory && (
                        <Button variant="secondary" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      )}
                      <Button variant="primary" type="submit">
                        {editingCategory ? "Update" : "Add"}
                      </Button>
                    </Form>

                    {categoryLoading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-muted mt-2">Loading categories...</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <Table hover className="align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>
                              <th>Category Name</th>
                              <th>Created Date</th>
                              <th className="text-end">Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {categories.length > 0 ? (
                              categories.map((category, index) => (
                                <tr key={category.id}>
                                  <td>{index + 1}</td>
                                  <td className="fw-semibold">{category.category}</td>
                                  <td className="text-muted">{formatDate(category.createdAt)}</td>
                                  <td className="text-end">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-2"
                                      onClick={() => handleEditCategory(category)}
                                    >
                                      <Edit size={14} />
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleDeleteCategory(category)}
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="text-center text-muted py-4">
                                  No categories found. Add one to get started.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>

      {/* User Form Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg" centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === "create" ? "Add New User" : "Edit User"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Email <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.email}
                    placeholder="user@example.com"
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Password {modalMode === "create" && <span className="text-danger">*</span>}
                    {modalMode === "edit" && <small className="text-muted"> (Leave blank to keep current)</small>}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.password}
                    placeholder={modalMode === "edit" ? "Enter new password" : "Enter password"}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.password}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    First Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="fname"
                    value={formData.fname}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.fname}
                    placeholder="John"
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.fname}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Last Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="lname"
                    value={formData.lname}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.lname}
                    placeholder="Doe"
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.lname}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phonenumber"
                    value={formData.phonenumber}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.phonenumber}
                    placeholder="0771234567"
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.phonenumber}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    User Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select name="usertype" value={formData.usertype} onChange={handleFormChange}>
                    <option value="USER">Worker (USER)</option>
                    <option value="ADMIN">Administrator (ADMIN)</option>
                    <option value="REVIEWER">Reviewer (REVIEWER)</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="123 Main St, City"
                  />
                </Form.Group>
              </Col>

              {formData.usertype === "USER" && (
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Skills</Form.Label>
                    <Form.Control
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleFormChange}
                      placeholder="Painting, Plumbing, Electrical (comma separated)"
                    />
                    <Form.Text className="text-muted">Enter skills separated by commas</Form.Text>
                  </Form.Group>
                </Col>
              )}

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>About</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="about"
                    value={formData.about}
                    onChange={handleFormChange}
                    placeholder="Brief description about the user..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUserModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? (modalMode === "create" ? "Creating..." : "Updating...") : modalMode === "create" ? "Create User" : "Update User"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View User Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Row>
              <Col md={6}>
                <p className="mb-2">
                  <strong>ID:</strong> #{selectedUser.id}
                </p>
                <p className="mb-2">
                  <strong>Name:</strong> {selectedUser.fname} {selectedUser.lname}
                </p>
                <p className="mb-2">
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p className="mb-2">
                  <strong>Phone:</strong> {selectedUser.phonenumber || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>User Type:</strong>{" "}
                  <Badge bg={getUserTypeBadge(selectedUser.usertype)}>{getUserTypeLabel(selectedUser.usertype)}</Badge>
                </p>
              </Col>
              <Col md={6}>
                <p className="mb-2">
                  <strong>Address:</strong> {selectedUser.address || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Skills:</strong> {selectedUser.skills || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Jobs Posted:</strong> {selectedUser._count?.jobs || 0}
                </p>
                <p className="mb-2">
                  <strong>Applications:</strong> {selectedUser._count?.jobApplications || 0}
                </p>
                <p className="mb-2">
                  <strong>Orders:</strong> {selectedUser._count?.orders || 0}
                </p>
              </Col>
              {selectedUser.about && (
                <Col xs={12} className="mt-3">
                  <p className="mb-2">
                    <strong>About:</strong>
                  </p>
                  <p className="text-muted">{selectedUser.about}</p>
                </Col>
              )}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <p>
              Are you sure you want to delete user{" "}
              <strong>
                {selectedUser.fname} {selectedUser.lname}
              </strong>
              ? This action cannot be undone.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Category Confirmation Modal */}
      <Modal show={showDeleteCategoryModal} onHide={() => setShowDeleteCategoryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCategory && (
            <p>
              Are you sure you want to delete the category <strong>{selectedCategory.category}</strong>? This action cannot be undone.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteCategoryModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteCategory} disabled={deletingCategory}>
            {deletingCategory ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnHover theme="colored" />
    </div>
  );
}
