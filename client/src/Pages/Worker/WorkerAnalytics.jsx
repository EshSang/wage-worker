import React from 'react';
import TopNavbar from '../../Components/TopNavbar';
import { Line, Bar } from "react-chartjs-2";
import 'chart.js/auto';
import Footer from '../../Components/Footer';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export default function WorkerAnalytics() {

  // Monthly Income Chart
  const incomeData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Monthly Income (LKR)",
        data: [45000, 52000, 61000, 58000, 67000, 72000],
        borderColor: "#28a745",
        tension: 0.4
      }
    ]
  };

  // Job Completion Chart
  const jobData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Completed Jobs",
        data: [12, 18, 25, 20, 28, 30],
        backgroundColor: "#0d6efd"
      }
    ]
  };

  return (
    <div className='bg-light'>
      {/* Navbar */}
      <TopNavbar />

      <div className="container-fluid p-4">
        <h3 className="fw-bold mb-4">Analytics & Reports</h3>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <StatCard title="Total Earnings" value="LKR 3,52,000" />
          <StatCard title="Completed Jobs" value="135" />
          <StatCard title="Monthly Growth" value="+12%" />
          <StatCard title="Completion Rate" value="94%" />
        </div>

        {/* Charts */}
        <div className="row g-4">
          <div className="col-md-8">
            <div className="card shadow-sm p-3">
              <h6 className="fw-bold">Monthly Income Report</h6>
              <Line data={incomeData} />
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm p-3">
              <h6 className="fw-bold">Job Completion Trend</h6>
              <Bar data={jobData} />
            </div>
          </div>
        </div>

        {/* Reports Portal
      <div className="card mt-5 shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold">📑 Reports Portal</h5>
          <p className="text-muted mt-2">
            Gain access to insightful data through a dedicated report portal,
            including monthly income reports, performance analytics, and job
            completion trends. This empowers workers to monitor their earnings,
            evaluate service effectiveness, and make informed decisions to
            improve their performance over time.
          </p>

          <ul className="list-group list-group-flush">
            <li className="list-group-item">📅 Monthly Income Reports</li>
            <li className="list-group-item">📊 Performance Analytics</li>
            <li className="list-group-item">📈 Job Completion Trends</li>
            <li className="list-group-item">⭐ Service Effectiveness Insights</li>
          </ul>
        </div>
      </div>
     */}

      </div>

      <Footer />
    </div>
  )
}


function StatCard({ title, value }) {
  return (
    <div className="col-md-3">
      <div className="card shadow-sm text-center p-3">
        <h6 className="text-muted">{title}</h6>
        <h4 className="fw-bold text-success">{value}</h4>
      </div>
    </div>
  );
}