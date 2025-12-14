import React from 'react';
import TopNavbar from '../../Components/TopNavbar';
import Footer from '../../Components/Footer';

export default function WorkerEarning() {

  const cards = [
    {
      title: "Total Earnings",
      value: "$792.98",
      subtitle: "This month $226.86",
      growth: "7.28%",
      icon: "💰",
    },
    {
      title: "Total Jobs Completed",
      value: "457",
      subtitle: "This month 38",
      growth: "7.28%",
      icon: "🧰",
    },
    {
      title: "Average Job Value",
      value: "$525.00",
      subtitle: "This month $226.86",
      growth: "7.28%",
      icon: "📊",
    },
  ];


  const orders = [
    {
      name: "Plumbing Service",
      date: "Aug 21, 2025",
      order: "JB-4691",
      status: "PAID",
      amount: "$150.00",
    },
    {
      name: "Electrical Repair",
      date: "Aug 22, 2025",
      order: "JB-4692",
      status: "PAID",
      amount: "$150.00",
    },
    {
      name: "Painting Work",
      date: "Aug 22, 2025",
      order: "JB-4693",
      status: "PAID",
      amount: "$80.00",
    },
    {
      name: "Carpentry Service",
      date: "Aug 25, 2025",
      order: "JB-4694",
      status: "PAID",
      amount: "$95.00",
    },
  ];

  return (
    <div className='bg-light'>
      {/* Navbar */}
      <TopNavbar />

      <div className="container-fluid p-4 min-vh-100">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold">Earnings Overview</h4>
            <small className="text-muted">Summary of your wage worker earnings</small>
          </div>
          <div>
            <button className="btn btn-outline-secondary me-2">April - June</button>
            <button className="btn btn-primary">Download CSV</button>
          </div>
        </div>


        {/* Summary Cards */}
        <div className="row g-3 mb-4">
          {cards.map((card, index) => (
            <div className="col-md-4" key={index}>
              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="fs-3 me-3">{card.icon}</div>
                    <div>
                      <h6 className="mb-0 text-muted">{card.title}</h6>
                      <h4 className="fw-bold">{card.value}</h4>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">{card.subtitle}</small>
                    <span className="text-success fw-semibold">↑ {card.growth}</span>
                  </div>
                  <div className="mt-2">
                    <a href="#" className="text-primary small">See details →</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Best Selling Services */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Top Earning Services</h6>
              <button className="btn btn-sm btn-outline-primary">All Services</button>
            </div>
            <div className="progress" style={{ height: "8px" }}>
              <div className="progress-bar bg-primary" style={{ width: "25%" }}></div>
              <div className="progress-bar bg-info" style={{ width: "25%" }}></div>
              <div className="progress-bar bg-success" style={{ width: "25%" }}></div>
              <div className="progress-bar bg-warning" style={{ width: "25%" }}></div>
            </div>
            <div className="row text-center mt-3">
              <div className="col">Plumbing<br /><small className="text-muted">10%</small></div>
              <div className="col">Electrical<br /><small className="text-muted">10%</small></div>
              <div className="col">Painting<br /><small className="text-muted">10%</small></div>
              <div className="col">Carpentry<br /><small className="text-muted">10%</small></div>
            </div>
          </div>
        </div>


        {/* Recent Jobs */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Recent Jobs</h6>
              <button className="btn btn-sm btn-outline-secondary">My Jobs</button>
            </div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table">
                  <tr>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Order ID</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={index}>
                      <td>{order.name}</td>
                      <td>{order.date}</td>
                      <td>{order.order}</td>
                      <td><span className="badge bg-success">{order.status}</span></td>
                      <td>{order.amount}</td>
                      <td><a href="#" className="text-primary">View</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div >

      <Footer />

    </div >
  )
}
