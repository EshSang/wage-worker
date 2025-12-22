import React from "react";
import { Container, Row, Col, Card, Table, Button, Form } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaFileDownload } from "react-icons/fa";
import TopNavbar from "../../Components/TopNavbar";
import Footer from "../../Components/Footer";
import "./ReviewerReports.css";

const monthlyData = [
  { month: "Jan", jobs: 120 },
  { month: "Feb", jobs: 150 },
  { month: "Mar", jobs: 180 },
  { month: "Apr", jobs: 140 },
  { month: "May", jobs: 200 },
];

const reportTableData = [
  {
    id: 1,
    period: "Jan 2025",
    totalJobs: 120,
    completed: 100,
    revenue: "LKR 120,000",
  },
  {
    id: 2,
    period: "Feb 2025",
    totalJobs: 150,
    completed: 135,
    revenue: "LKR 150,000",
  },
  {
    id: 3,
    period: "Mar 2025",
    totalJobs: 180,
    completed: 160,
    revenue: "LKR 180,000",
  },
];

export default function ReviewerReports() {
  return (
    <div>
      <TopNavbar />
      <div className="px-4 py-4 bg-light min-vh-100">
      <Container fluid className="p-4">
        {/* <h4 className="fw-bold mb-4">📊 Reports</h4> */}
        <h4 className="fw-bold mb-4">Reports</h4>

        {/* ================= FILTER & DOWNLOAD ================= */}
        <Card className="mb-4 report-card">
          <Card.Body>
            <Row className="align-items-end g-3">
              <Col md={4}>
                <Form.Label>Select Month</Form.Label>
                <Form.Control type="month" />
              </Col>

              <Col md={4}>
                <Form.Label>Select Year</Form.Label>
                <Form.Select>
                  <option>2025</option>
                  <option>2024</option>
                  <option>2023</option>
                </Form.Select>
              </Col>

              <Col md={4}>
                <Button className="w-100 report-btn">
                  <FaFileDownload className="me-2" />
                  Download Report
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ================= CHART VIEW ================= */}
        <Card className="mb-4 report-card">
          <Card.Body>
            <h5 className="fw-bold mb-3">📈 Monthly Job Statistics</h5>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jobs" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>

        {/* ================= TABLE VIEW ================= */}
        <Card className="report-card">
          <Card.Body>
            <h5 className="fw-bold mb-3">📋 Detailed Report</h5>

            <div className="table-responsive">
              <Table hover className="align-middle report-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Period</th>
                    <th>Total Jobs</th>
                    <th>Completed Jobs</th>
                    <th>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportTableData.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.period}</td>
                      <td>{row.totalJobs}</td>
                      <td>{row.completed}</td>
                      <td>{row.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>
      </div>
      <Footer />
    </div>
  );
}
