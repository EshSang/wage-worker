import React, { useState } from "react";
import {
  Card,
  Table,
  Badge,
  Button,
  Row,
  Col,
  Form,
  Nav,
} from "react-bootstrap";
import { Eye, CheckCircle, XCircle } from "react-bootstrap-icons";
import TopNavbar from '../../Components/TopNavbar'
import Footer from '../../Components/Footer'

export default function ReviewerReviewRequest() {
  const [activeTab, setActiveTab] = useState("reviews");

  const reviews = [
    {
      id: "REV-1001",
      type: "Client → Worker",
      name: "Nimal Perera",
      target: "Kamal (Plumber)",
      rating: 5,
      date: "2025-12-20",
      status: "Pending",
    },
    {
      id: "REV-1002",
      type: "Worker → Client",
      name: "Sunil",
      target: "Saman Silva",
      rating: 4,
      date: "2025-12-19",
      status: "Pending",
    },
  ];

  const jobPosts = [
    {
      id: "JOB-2301",
      service: "Electrical",
      client: "Kasun Fernando",
      date: "2025-12-18",
      status: "Pending",
    },
  ];

  const statusBadge = (status) =>
    status === "Pending" ? "warning" : status === "Approved" ? "success" : "danger";

  return (
    <div>
      <TopNavbar />
      <div className="px-4 py-4 bg-light min-vh-100">

      {/* ===== Header ===== */}
      {/* <h4 className="fw-bold mb-4">🛡 Review Moderation</h4> */}
      <h4 className="fw-bold mb-4">Review Moderation</h4>

      {/* ===== Stats ===== */}
      <Row className="g-3 mb-4">
        {[
          { title: "Pending Requests", value: 14 },
          { title: "Approved", value: 82 },
          { title: "Rejected", value: 9 },
        ].map((item, index) => (
          <Col md={4} key={index}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body>
                <h6 className="text-muted">{item.title}</h6>
                <h3 className="fw-bold">{item.value}</h3>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ===== Tabs ===== */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Nav variant="pills" activeKey={activeTab}>
            <Nav.Item>
              <Nav.Link eventKey="reviews" onClick={() => setActiveTab("reviews")}>
                ⭐ Reviews
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="jobs" onClick={() => setActiveTab("jobs")}>
                🛠 Job Posts
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>

      {/* ===== Filters ===== */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Control placeholder="🔍 Search..." />
            </Col>
            <Col md={4}>
              <Form.Select>
                <option>Status: All</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Control type="date" />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ===== Content ===== */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                {activeTab === "reviews" ? (
                  <>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Rating</th>
                  </>
                ) : (
                  <>
                    <th>Service</th>
                    <th>Client</th>
                  </>
                )}
                <th>Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {(activeTab === "reviews" ? reviews : jobPosts).map((item) => (
                <tr key={item.id}>
                  <td className="fw-semibold">{item.id}</td>

                  {activeTab === "reviews" ? (
                    <>
                      <td>{item.type}</td>
                      <td>{item.name}</td>
                      <td>{item.target}</td>
                      <td>⭐ {item.rating}</td>
                    </>
                  ) : (
                    <>
                      <td>{item.service}</td>
                      <td>{item.client}</td>
                    </>
                  )}

                  <td>{item.date}</td>
                  <td>
                    <Badge bg={statusBadge(item.status)} pill>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button size="sm" variant="light" className="me-2 border">
                      <Eye />
                    </Button>
                    <Button size="sm" variant="success" className="me-2">
                      <CheckCircle />
                    </Button>
                    <Button size="sm" variant="danger">
                      <XCircle />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
    </div>
  );
}
