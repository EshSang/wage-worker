import React, { useState, useEffect } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Badge,
  Spinner,
} from "react-bootstrap";
import { FaMoneyBillWave, FaClipboardList } from "react-icons/fa";
import TopNavbar from '../../Components/TopNavbar'
import Footer from '../../Components/Footer';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import "./AdminEarnings.css";

export default function AdminEarnings() {
  const [filters, setFilters] = useState({
    status: "All",
    categoryId: "All",
    fromDate: "",
    toDate: "",
  });

  const [earnings, setEarnings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState({
    totalEarnings: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
  });

  useEffect(() => {
    fetchStatistics();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [filters, pagination.currentPage]);

  const fetchStatistics = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/earnings/statistics');
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/categories');
      setCategories(response.data.categories || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.pageSize,
      });

      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters.categoryId && filters.categoryId !== 'All') params.append('categoryId', filters.categoryId);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);

      const response = await axiosInstance.get(`/api/admin/earnings?${params}`);

      if (response.data.success) {
        setEarnings(response.data.data.earnings);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const earningsSummary = [
    {
      title: "Total Earnings",
      amount: formatCurrency(statistics.totalEarnings),
      icon: <FaMoneyBillWave />,
    },
    {
      title: "Completed Orders",
      amount: statistics.completedOrders,
      icon: <FaClipboardList />,
    },
  ];

  return (
    <div>
      <TopNavbar />
      <div className="px-4 py-4 bg-light min-vh-100">
       <Container fluid className="p-4">
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
              <Form.Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option>All</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              >
                <option value="All">All</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              />
            </Col>

            <Col md={3}>
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ================= EARNINGS TABLE ================= */}
      <Card className="earning-card">
        <Card.Body>
          <h5 className="fw-bold mb-3">📋 Orders & Earnings</h5>

          <div className="table-responsive">
            {loading ? (
              <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading earnings...</p>
              </div>
            ) : earnings.length === 0 ? (
              <div className="text-center p-5">
                <p className="text-muted">No earnings found</p>
              </div>
            ) : (
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
                  {earnings.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.orderId || item.id}</td>
                      <td>{new Date(item.earnedDate).toLocaleDateString()}</td>
                      <td>{item.job?.category?.category || 'N/A'}</td>
                      <td>
                        <Badge
                          bg={
                            item.status === "COMPLETED"
                              ? "success"
                              : "warning"
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="fw-bold text-primary">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <button
                className="btn btn-outline-primary btn-sm me-2"
                disabled={pagination.currentPage === 1}
                onClick={() =>
                  setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })
                }
              >
                Previous
              </button>
              <span className="align-self-center mx-3">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() =>
                  setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })
                }
              >
                Next
              </button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
    </div>
    <Footer/>

    </div>
  )
}
