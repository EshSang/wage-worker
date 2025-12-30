import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Form, Dropdown, Spinner } from "react-bootstrap";
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
import axiosInstance from "../../api/axios";
import { toast } from "react-toastify";
import "./AdminReports.css";

export default function AdminReports() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [monthlyData, setMonthlyData] = useState([]);
  const [reportTableData, setReportTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set current month by default
    const currentMonth = new Date().getMonth() + 1;
    setSelectedMonth(`${selectedYear}-${currentMonth.toString().padStart(2, '0')}`);
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchYearlyData();
    }
  }, [selectedYear]);

  const fetchYearlyData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/admin/reports/yearly?year=${selectedYear}`);

      if (response.data.success) {
        const data = response.data.data;

        // Transform data for bar chart
        const chartData = data.monthlyData.map(item => ({
          month: item.month.substring(0, 3),
          jobs: item.jobs,
        }));
        setMonthlyData(chartData);

        // Transform data for table
        const tableData = data.monthlyData
          .filter(item => item.jobs > 0 || item.completedJobs > 0 || item.revenue > 0)
          .map((item, index) => ({
            id: index + 1,
            period: `${item.month} ${selectedYear}`,
            totalJobs: item.jobs,
            completed: item.completedJobs,
            revenue: `LKR ${item.revenue.toLocaleString()}`,
          }));
        setReportTableData(tableData);
      }
    } catch (error) {
      console.error('Error fetching yearly data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (format) => {
    try {
      if (!selectedMonth) {
        toast.error('Please select a month');
        return;
      }

      const [year, month] = selectedMonth.split('-');

      toast.info(`Generating ${format.toUpperCase()} report...`);

      const response = await axiosInstance.get(
        `/api/admin/reports/download/${format}?month=${month}&year=${year}`,
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${year}-${month}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} report downloaded successfully`);
    } catch (error) {
      console.error(`Error downloading ${format} report:`, error);
      toast.error(`Failed to download ${format.toUpperCase()} report`);
    }
  };
  return (
    <div>
      <TopNavbar />
      <div className="px-4 py-4 bg-light min-vh-100">
      <Container fluid className="p-4">
        <h4 className="fw-bold mb-4">Reports</h4>

        {/* ================= FILTER & DOWNLOAD ================= */}
        <Card className="mb-4 report-card">
          <Card.Body>
            <Row className="align-items-end g-3">
              <Col md={3}>
                <Form.Label>Select Month</Form.Label>
                <Form.Control
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </Col>

              <Col md={3}>
                <Form.Label>Select Year</Form.Label>
                <Form.Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </Form.Select>
              </Col>

              <Col md={3}>
                <Button
                  className="w-100 report-btn"
                  onClick={() => handleDownloadReport('pdf')}
                >
                  <FaFileDownload className="me-2" />
                  Download PDF
                </Button>
              </Col>

              <Col md={3}>
                <Button
                  className="w-100 report-btn"
                  onClick={() => handleDownloadReport('excel')}
                >
                  <FaFileDownload className="me-2" />
                  Download Excel
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ================= CHART VIEW ================= */}
        <Card className="mb-4 report-card">
          <Card.Body>
            <h5 className="fw-bold mb-3">📈 Monthly Job Statistics</h5>

            {loading ? (
              <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading chart data...</p>
              </div>
            ) : monthlyData.length === 0 ? (
              <div className="text-center p-5">
                <p className="text-muted">No data available for the selected year</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="jobs" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card>

        {/* ================= TABLE VIEW ================= */}
        <Card className="report-card">
          <Card.Body>
            <h5 className="fw-bold mb-3">📋 Detailed Report</h5>

            <div className="table-responsive">
              {loading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Loading report data...</p>
                </div>
              ) : reportTableData.length === 0 ? (
                <div className="text-center p-5">
                  <p className="text-muted">No report data available for the selected year</p>
                </div>
              ) : (
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
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
      </div>
      <Footer />
    </div>
  );
}
