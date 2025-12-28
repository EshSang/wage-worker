import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axiosInstance from '../api/axios';
import { toast } from 'react-toastify';

export default function UserFormModal({ show, mode, user, onHide, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fname: '',
    lname: '',
    phonenumber: '',
    address: '',
    skills: '',
    about: '',
    usertype: 'USER',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        email: user.email || '',
        password: '', // Don't populate password for edit
        fname: user.fname || '',
        lname: user.lname || '',
        phonenumber: user.phonenumber || '',
        address: user.address || '',
        skills: user.skills || '',
        about: user.about || '',
        usertype: user.usertype || 'USER',
      });
    } else {
      // Reset form for create mode
      setFormData({
        email: '',
        password: '',
        fname: '',
        lname: '',
        phonenumber: '',
        address: '',
        skills: '',
        about: '',
        usertype: 'USER',
      });
    }
    setErrors({});
  }, [mode, user, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (mode === 'create' && !formData.password) {
      newErrors.password = 'Password is required';
    }

    if (mode === 'create' && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.fname) {
      newErrors.fname = 'First name is required';
    }

    if (!formData.lname) {
      newErrors.lname = 'Last name is required';
    }

    if (formData.phonenumber && !/^[0-9]{10}$/.test(formData.phonenumber.replace(/\s/g, ''))) {
      newErrors.phonenumber = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data (remove empty password for edit mode)
      const submitData = { ...formData };
      if (mode === 'edit' && !submitData.password) {
        delete submitData.password;
      }

      if (mode === 'create') {
        await axiosInstance.post('/api/admin/users', submitData);
        toast.success('User created successfully');
      } else {
        await axiosInstance.put(`/api/admin/users/${user.id}`, submitData);
        toast.success('User updated successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save user';
      toast.error(errorMessage);

      // Set field-specific error if applicable
      if (errorMessage.includes('Email')) {
        setErrors({ email: errorMessage });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === 'create' ? 'Add New User' : 'Edit User'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            {/* Email */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  placeholder="user@example.com"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Password */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Password {mode === 'create' && <span className="text-danger">*</span>}
                  {mode === 'edit' && <small className="text-muted">(Leave blank to keep current)</small>}
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  placeholder={mode === 'edit' ? 'Enter new password' : 'Enter password'}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* First Name */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="fname"
                  value={formData.fname}
                  onChange={handleChange}
                  isInvalid={!!errors.fname}
                  placeholder="John"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fname}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Last Name */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="lname"
                  value={formData.lname}
                  onChange={handleChange}
                  isInvalid={!!errors.lname}
                  placeholder="Doe"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lname}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Phone Number */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleChange}
                  isInvalid={!!errors.phonenumber}
                  placeholder="0771234567"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phonenumber}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* User Type */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>User Type <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="usertype"
                  value={formData.usertype}
                  onChange={handleChange}
                >
                  <option value="USER">Worker (USER)</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Administrator</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Address */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main St, City"
                />
              </Form.Group>
            </Col>

            {/* Skills (for workers) */}
            {formData.usertype === 'USER' && (
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Skills</Form.Label>
                  <Form.Control
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="Painting, Plumbing, Electrical (comma separated)"
                  />
                  <Form.Text className="text-muted">
                    Enter skills separated by commas
                  </Form.Text>
                </Form.Group>
              </Col>
            )}

            {/* About */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label>About</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  placeholder="Brief description about the user..."
                />
              </Form.Group>
            </Col>
          </Row>

          {mode === 'edit' && (
            <Alert variant="info" className="mt-3 mb-0">
              <small>
                <strong>Note:</strong> Leave the password field blank if you don't want to change it.
              </small>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create User' : 'Update User')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
