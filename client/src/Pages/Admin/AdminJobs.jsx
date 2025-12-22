import React, { useState } from "react";
import {
  Card,
  Table,
  Badge,
  Button,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import { Eye, PersonPlus, XCircle } from "react-bootstrap-icons";
import TopNavbar from '../../Components/TopNavbar'
import Footer from '../../Components/Footer'

export default function AdminJobs() {
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    service: "All",
    date: "",
  });

  const jobs = [
    {
      id: "JOB-1023",
      service: "Plumbing",
      customer: "Nimal Perera",
      worker: "Kamal",
      date: "2025-12-20",
      status: "Active",
    },
    {
      id: "JOB-1024",
      service: "Electrical",
      customer: "Saman Silva",
      worker: "—",
      date: "2025-12-19",
      status: "Pending",
    },
    {
      id: "JOB-1025",
      service: "Painting",
      customer: "Kasun Fernando",
      worker: "Sunil",
      date: "2025-12-18",
      status: "Completed",
    },
  ];

  const statusVariant = (status) => {
    switch (status) {
      case "Active":
        return "primary";
      case "Pending":
        return "warning";
      case "Completed":
        return "success";
      case "Cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (

    <div>
    <TopNavbar />
    <div className="px-4 py-4 bg-light min-vh-100">

      {/* ===== Page Header ===== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* <h4 className="fw-bold">🛠 Jobs Management</h4> */}
        <h4 className="fw-bold">Jobs</h4>
      </div>

      {/* ===== Stats Cards ===== */}
      <Row className="g-3 mb-4">
        {[
          { title: "Total Jobs", value: 124 },
          { title: "Active Jobs", value: 42 },
          { title: "Completed", value: 65 },
          { title: "Cancelled", value: 17 },
        ].map((item, index) => (
          <Col md={3} key={index}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body>
                <h6 className="text-muted">{item.title}</h6>
                <h3 className="fw-bold">{item.value}</h3>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ===== Filters ===== */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Control
                placeholder="🔍 Search Job / Customer"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </Col>

            <Col md={3}>
              <Form.Select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option>All</option>
                <option>Pending</option>
                <option>Active</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Select
                value={filters.service}
                onChange={(e) =>
                  setFilters({ ...filters, service: e.target.value })
                }
              >
                <option>All Services</option>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Painting</option>
                <option>Cleaning</option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Control
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters({ ...filters, date: e.target.value })
                }
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ===== Jobs Table ===== */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Job ID</th>
                <th>Service</th>
                <th>Customer</th>
                <th>Worker</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="fw-semibold">{job.id}</td>
                  <td>{job.service}</td>
                  <td>{job.customer}</td>
                  <td>{job.worker}</td>
                  <td>{job.date}</td>
                  <td>
                    <Badge bg={statusVariant(job.status)} pill>
                      {job.status}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button
                      variant="light"
                      size="sm"
                      className="me-2 border"
                    >
                      <Eye />
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      className="me-2 border"
                    >
                      <PersonPlus />
                    </Button>
                    <Button variant="light" size="sm" className="border">
                      <XCircle className="text-danger" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
    <Footer/>
    </div>
  );
}
