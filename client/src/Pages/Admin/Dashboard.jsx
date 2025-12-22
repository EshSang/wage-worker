import React from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup } from "react-bootstrap";
import { Users, Briefcase, CalendarCheck, DollarSign, Search, ArrowUpRight } from "lucide-react";
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';

export default function Dashboard() {
  return (
    <div>
      <TopNavbar />

      <Container fluid className="bg-light min-vh-100 p-4">
        {/* Header */}
        <Row className="mb-4 align-items-center">
          <Col>
            <h4 className="fw-bold mb-1">Dashboard</h4>
            <p className="text-muted mb-0">Wage Worker Management System</p>
          </Col>
        </Row>

        {/* Stat Cards */}
        <Row className="g-4 mb-4">
          {[{
            title: "Active Users",
            value: "420",
            note: "Registered workers & customers",
            icon: <Users />,
            color: "primary"
          },{
            title: "Jobs Posted",
            value: "150",
            note: "New & ongoing jobs",
            icon: <Briefcase />,
            color: "success"
          },{
            title: "Active Bookings",
            value: "38",
            note: "Currently assigned",
            icon: <CalendarCheck />,
            color: "warning"
          },{
            title: "Total Revenue",
            value: "LKR 1.2M",
            note: "Overall earnings",
            icon: <DollarSign />,
            color: "info"
          }].map((card, i) => (
            <Col md={3} key={i}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className={`p-3 rounded-circle bg-${card.color} bg-opacity-10 text-${card.color}`}>
                      {card.icon}
                    </div>
                    <ArrowUpRight className="text-muted" size={18} />
                  </div>
                  <h3 className="fw-bold mb-0">{card.value}</h3>
                  <p className="text-muted mb-1">{card.title}</p>
                  <small className="text-muted">{card.note}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Main Content */}
        <Row className="g-4">
          {/* ================== UPDATED SECTION ONLY ================== */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Recent Job Requests</h6>
                  <InputGroup style={{ maxWidth: 260 }}>
                    <InputGroup.Text className="bg-white border-end-0">
                      <Search size={16} />
                    </InputGroup.Text>
                    <Form.Control
                      className="border-start-0"
                      placeholder="Search job, role..."
                    />
                  </InputGroup>
                </div>

                <div className="table-responsive">
                  <Table hover borderless className="align-middle">
                    <thead className="text-muted small">
                      <tr>
                        <th>Job</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[{
                        title: "Good Painter",
                        desc: "Shop wall painting",
                        role: "Painter",
                        location: "Maharagama",
                        status: "Open",
                        rate: "LKR 400/hr"
                      },{
                        title: "Need Welder",
                        desc: "Experienced welder",
                        role: "Welder",
                        location: "Kottawa",
                        status: "Open",
                        rate: "LKR 600/hr"
                      }].map((job, i) => (
                        <tr key={i} className="rounded-3">
                          <td>
                            <div className="fw-semibold">{job.title}</div>
                            <small className="text-muted">{job.desc}</small>
                          </td>
                          <td>
                            <Badge bg="light" text="dark" className="px-3 py-1 rounded-pill">
                              {job.role}
                            </Badge>
                          </td>
                          <td className="text-muted">{job.location}</td>
                          <td>
                            <Badge bg="success" className="px-3 py-1 rounded-pill">
                              {job.status}
                            </Badge>
                          </td>
                          <td className="fw-semibold">{job.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
          {/* ================== END UPDATED SECTION ================== */}

          {/* Right Panel */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 mb-4">
              <Card.Body>
                <h6 className="fw-bold mb-3">Admin Activity</h6>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">🧑‍🔧</div>
                  <div><strong>12</strong> new workers registered</div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">📌</div>
                  <div><strong>5</strong> jobs awaiting assignment</div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-3">💰</div>
                  <div><strong>LKR 120,000</strong> revenue today</div>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm rounded-4 bg-primary bg-gradient text-white">
              <Card.Body>
                <h6 className="fw-bold">Validation Queue</h6>
                <p className="small opacity-75 mb-3">
                  Workers & documents pending approval
                </p>
                <Button variant="light" size="sm" className="rounded-pill">
                  Review Now
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
}
