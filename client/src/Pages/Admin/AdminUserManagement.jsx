import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Users, UserPlus, Search, Edit, Trash2, Eye } from 'lucide-react';
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';
import axiosInstance from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserFormModal from '../../Components/UserFormModal';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    usertype: 'ALL',
    search: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
  });

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchStatistics = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/users/statistics');
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error('Failed to load statistics');
      }
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.usertype !== 'ALL') params.append('usertype', filters.usertype);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await axiosInstance.get(`/api/admin/users?${params.toString()}`);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error('Failed to load users');
      }
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value,
    }));
  };

  const handleAddUser = () => {
    setModalMode('create');
    setSelectedUser(null);
    setShowFormModal(true);
  };

  const handleEditUser = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setShowFormModal(true);
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/admin/users/${userId}`);
      setSelectedUser(response.data.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
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
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setSelectedUser(null);
    fetchUsers();
    fetchStatistics();
  };

  const getUserTypeBadge = (usertype) => {
    const variants = {
      ADMIN: 'danger',
      USER: 'primary',
      CUSTOMER: 'success',
    };
    return variants[usertype] || 'secondary';
  };

  return (
    <div>
      <TopNavbar />

      <Container fluid className="bg-light min-vh-100 p-4">
        {/* Header */}
        <Row className="mb-4 align-items-center">
          <Col>
            <h4 className="fw-bold mb-1">User Management</h4>
            <p className="text-muted mb-0">Manage all system users</p>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={handleAddUser}>
              <UserPlus size={18} className="me-2" />
              Add New User
            </Button>
          </Col>
        </Row>

        {/* Statistics Cards */}
        {statistics && (
          <Row className="g-4 mb-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary">
                      <Users size={24} />
                    </div>
                  </div>
                  <h3 className="fw-bold mb-0">{statistics.totalUsers}</h3>
                  <p className="text-muted mb-0">Total Users</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="p-3 rounded-circle bg-danger bg-opacity-10 text-danger">
                      <Users size={24} />
                    </div>
                  </div>
                  <h3 className="fw-bold mb-0">{statistics.adminUsers}</h3>
                  <p className="text-muted mb-0">Administrators</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary">
                      <Users size={24} />
                    </div>
                  </div>
                  <h3 className="fw-bold mb-0">{statistics.workerUsers}</h3>
                  <p className="text-muted mb-0">Workers</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="p-3 rounded-circle bg-success bg-opacity-10 text-success">
                      <Users size={24} />
                    </div>
                  </div>
                  <h3 className="fw-bold mb-0">{statistics.customerUsers}</h3>
                  <p className="text-muted mb-0">Customers</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small text-muted">User Type</Form.Label>
                  <Form.Select
                    value={filters.usertype}
                    onChange={(e) => handleFilterChange('usertype', e.target.value)}
                  >
                    <option value="ALL">All Users</option>
                    <option value="ADMIN">Administrators</option>
                    <option value="USER">Workers</option>
                    <option value="CUSTOMER">Customers</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="small text-muted">Search</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white">
                      <Search size={16} />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search by name or email..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">All Users</h6>
              <small className="text-muted">
                Showing {users.length} of {pagination.totalCount} users
              </small>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2">Loading users...</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table hover borderless className="align-middle">
                    <thead className="text-muted small border-bottom">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>User Type</th>
                        <th>Jobs</th>
                        <th>Applications</th>
                        <th>Orders</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map(user => (
                          <tr key={user.id}>
                            <td className="fw-semibold">#{user.id}</td>
                            <td>
                              <div>
                                <div className="fw-semibold">{user.fname} {user.lname}</div>
                              </div>
                            </td>
                            <td className="text-muted">{user.email}</td>
                            <td className="text-muted">{user.phonenumber || 'N/A'}</td>
                            <td>
                              <Badge bg={getUserTypeBadge(user.usertype)} className="rounded-pill">
                                {user.usertype}
                              </Badge>
                            </td>
                            <td className="text-center">{user._count.jobs}</td>
                            <td className="text-center">{user._count.jobApplications}</td>
                            <td className="text-center">{user._count.orders}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline-info"
                                  onClick={() => handleViewUser(user.id)}
                                >
                                  <Eye size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => handleDeleteUser(user)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center text-muted py-5">
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
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </small>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={pagination.currentPage === 1}
                        onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
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
      </Container>

      <Footer />

      {/* User Form Modal */}
      <UserFormModal
        show={showFormModal}
        mode={modalMode}
        user={selectedUser}
        onHide={() => {
          setShowFormModal(false);
          setSelectedUser(null);
        }}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <p>
              Are you sure you want to delete user <strong>{selectedUser.fname} {selectedUser.lname}</strong>?
              This action cannot be undone.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
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
                <p className="mb-2"><strong>ID:</strong> #{selectedUser.id}</p>
                <p className="mb-2"><strong>Name:</strong> {selectedUser.fname} {selectedUser.lname}</p>
                <p className="mb-2"><strong>Email:</strong> {selectedUser.email}</p>
                <p className="mb-2"><strong>Phone:</strong> {selectedUser.phonenumber || 'N/A'}</p>
                <p className="mb-2"><strong>User Type:</strong> <Badge bg={getUserTypeBadge(selectedUser.usertype)}>{selectedUser.usertype}</Badge></p>
              </Col>
              <Col md={6}>
                <p className="mb-2"><strong>Address:</strong> {selectedUser.address || 'N/A'}</p>
                <p className="mb-2"><strong>Skills:</strong> {selectedUser.skills || 'N/A'}</p>
                <p className="mb-2"><strong>Jobs Posted:</strong> {selectedUser._count?.jobs || 0}</p>
                <p className="mb-2"><strong>Applications:</strong> {selectedUser._count?.jobApplications || 0}</p>
                <p className="mb-2"><strong>Orders:</strong> {selectedUser._count?.orders || 0}</p>
              </Col>
              {selectedUser.about && (
                <Col xs={12} className="mt-3">
                  <p className="mb-2"><strong>About:</strong></p>
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

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
