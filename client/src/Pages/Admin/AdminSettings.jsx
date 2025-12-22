import "./AdminSettings.css";
import React, { useState } from "react";
import {
  Container,
  Tabs,
  Tab,
  Card,
  Table,
  Badge,
  Button,
  Form,
} from "react-bootstrap";
import TopNavbar from "../../Components/TopNavbar";
import Footer from "../../Components/Footer";


export default function AdminSettings() {
  const [activeKey, setActiveKey] = useState("users");

  return (
    <div>
      <TopNavbar />
      <Container fluid className="bg-light min-vh-100 p-4">
        <Card className="border-0 shadow-sm">
          <Card.Body>
            {/* <h4 className="fw-bold mb-4">⚙️ Admin Settings</h4> */}
            <h4 className="fw-bold mb-4">Settings</h4>

            {/* Tabs */}
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
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold mb-0">User Accounts</h5>
                      <Button variant="primary" size="sm">
                        + Add User
                      </Button>
                    </div>

                    <div className="table-responsive">
                      <Table hover className="align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr>
                            <td>#U1001</td>
                            <td>Kasun Perera</td>
                            <td>kasun@gmail.com</td>
                            <td>
                              <Badge bg="info">Worker</Badge>
                            </td>
                            <td>
                              <Badge bg="success">Active</Badge>
                            </td>
                            <td className="text-end">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                              >
                                View
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                              >
                                Edit Role
                              </Button>
                              <Button variant="outline-danger" size="sm">
                                Delete
                              </Button>
                            </td>
                          </tr>

                          <tr>
                            <td>#U1002</td>
                            <td>Nimali Silva</td>
                            <td>nimali@gmail.com</td>
                            <td>
                              <Badge bg="dark">Admin</Badge>
                            </td>
                            <td>
                              <Badge bg="secondary">Disabled</Badge>
                            </td>
                            <td className="text-end">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                              >
                                View
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                              >
                                Edit Role
                              </Button>
                              <Button variant="outline-danger" size="sm">
                                Delete
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab>

              {/* ================= SERVICE CATEGORY TAB ================= */}
              <Tab eventKey="services" title="🛠 Service Category Management">
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <h5 className="fw-bold mb-3">Service Categories</h5>

                    {/* Add Category */}
                    <Form className="d-flex gap-2 mb-4">
                      <Form.Control
                        type="text"
                        placeholder="Enter service category (e.g., Plumbing)"
                      />
                      <Button variant="primary">Add</Button>
                    </Form>

                    {/* Category Table */}
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
                          <tr>
                            <td>1</td>
                            <td>Plumbing</td>
                            <td>2025-01-10</td>
                            <td className="text-end">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                              >
                                Edit
                              </Button>
                              <Button variant="outline-danger" size="sm">
                                Delete
                              </Button>
                            </td>
                          </tr>

                          <tr>
                            <td>2</td>
                            <td>Welder</td>
                            <td>2025-01-12</td>
                            <td className="text-end">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                              >
                                Edit
                              </Button>
                              <Button variant="outline-danger" size="sm">
                                Delete
                              </Button>
                            </td>
                          </tr>

                          <tr>
                            <td>3</td>
                            <td>Painter</td>
                            <td>2025-01-15</td>
                            <td className="text-end">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                              >
                                Edit
                              </Button>
                              <Button variant="outline-danger" size="sm">
                                Delete
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
      <Footer />
    </div>
  );
}
