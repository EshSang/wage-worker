import React from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Badge,
} from "react-bootstrap";
import { FaMoneyBillWave, FaClipboardList } from "react-icons/fa";
import TopNavbar from '../../Components/TopNavbar'
import Footer from '../../Components/Footer';
import "./AdminEarnings.css";

const earningsSummary = [
  {
    title: "Total Earnings",
    amount: "LKR 520,000",
    icon: <FaMoneyBillWave />,
  },
  {
    title: "Completed Orders",
    amount: "320",
    icon: <FaClipboardList />,
  },
];

const earningsData = [
  {
    id: 101,
    date: "2025-03-10",
    category: "Plumbing",
    status: "Completed",
    amount: "LKR 12,000",
  },
  {
    id: 102,
    date: "2025-03-12",
    category: "Electrician",
    status: "Pending",
    amount: "LKR 8,000",
  },
  {
    id: 103,
    date: "2025-03-14",
    category: "Painting",
    status: "Completed",
    amount: "LKR 15,000",
  },
];

export default function AdminEarnings() {
  return (
    <div>
      <TopNavbar />
       <Container fluid className="p-4">
      {/* <h4 className="fw-bold mb-4">💰 Earnings & Orders</h4> */}
      <h4 className="fw-bold mb-4">Earnings</h4>

      {/* ================= SUMMARY CARDS ================= */}
      <Row className="mb-4">
        {earningsSummary.map((item, index) => (
          <Col md={6} key={index}>
            <Card className="earning-card">
              <Card.Body className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">{item.title}</p>
                  <h4 className="fw-bold">{item.amount}</h4>
                </div>
                <div className="earning-icon">{item.icon}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ================= FILTERS ================= */}
      <Card className="mb-4 earning-card">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Label>Status</Form.Label>
              <Form.Select>
                <option>All</option>
                <option>Completed</option>
                <option>Pending</option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label>Category</Form.Label>
              <Form.Select>
                <option>All</option>
                <option>Plumbing</option>
                <option>Electrician</option>
                <option>Painting</option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label>From Date</Form.Label>
              <Form.Control type="date" />
            </Col>

            <Col md={3}>
              <Form.Label>To Date</Form.Label>
              <Form.Control type="date" />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ================= EARNINGS TABLE ================= */}
      <Card className="earning-card">
        <Card.Body>
          <h5 className="fw-bold mb-3">📋 Orders & Earnings</h5>

          <div className="table-responsive">
            <Table hover className="align-middle earning-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Earning</th>
                </tr>
              </thead>
              <tbody>
                {earningsData.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>{item.date}</td>
                    <td>{item.category}</td>
                    <td>
                      <Badge
                        bg={
                          item.status === "Completed"
                            ? "success"
                            : "warning"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="fw-bold text-primary">
                      {item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
    </div>
  )
}
