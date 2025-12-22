import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';

// Auth Pages
import SignUp from './Pages/Auth/SignUp'
import SignIn from './Pages/Auth/SignIn'

// Common Pages
import Home from './Pages/Common/Home';

// Worker Pages
import WorkerJobs from './Pages/Worker/WorkerJobs';
import WorkerMyService from './Pages/Worker/WorkerMyService';
import WorkerOrders from './Pages/Worker/WorkerOrders';
import WorkerEarning from './Pages/Worker/WorkerEarning';
import WorkerReviews from './Pages/Worker/WorkerReviews';
import WorkerAnalytics from './Pages/Worker/WorkerAnalytics';
import WorkerViewJob from './Pages/Worker/WorkerViewJob';

// Customer Pages
import CustomerJobs from './Pages/Customer/CustomerJobs';
import CustomerJobPost from './Pages/Customer/CustomerJobPost';
import CustomerOrders from './Pages/Customer/CustomerOrders';
import CustomerPostedJobs from './Pages/Customer/CustomerPostedJobs';
import CustomerReviews from './Pages/Customer/CustomerReviews';
import CustomerAnalytics from './Pages/Customer/CustomerAnalytics';

// Admin Pages
import Dashboard from './Pages/Admin/Dashboard';
import AdminJobs from './Pages/Admin/AdminJobs';
import AdminOrders from './Pages/Admin/AdminOrders';
import AdminEarnings from './Pages/Admin/AdminEarnings';
import AdminReports from './Pages/Admin/AdminReports';
import AdminSettings from './Pages/Admin/AdminSettings';

// Reviewer Pages
import ReviewerDashboard from './Pages/Reviewer/ReviewerDashboard';
import ReviewerJobs from './Pages/Reviewer/ReviewerJobs';
import ReviewerReports from './Pages/Reviewer/ReviewerReports'; 
import ReviewerReviewRequest from './Pages/Reviewer/ReviewerReviewRequest';
import ReviewerHistory from './Pages/Reviewer/ReviewerHistory';

function App() {
  

  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>

            {/* Public Routes */}
            <Route path="/" element={<SignIn />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes */}
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

            {/* Worker Pages */}
            <Route path="/workerjob" element={<ProtectedRoute><WorkerJobs/></ProtectedRoute>} />
            <Route path="/workermyservice" element={<ProtectedRoute><WorkerMyService/></ProtectedRoute>} />
            <Route path="/workerorders" element={<ProtectedRoute><WorkerOrders/></ProtectedRoute>} />
            <Route path="/workerearning" element={<ProtectedRoute><WorkerEarning/></ProtectedRoute>} />
            <Route path="/workerreviews" element={<ProtectedRoute><WorkerReviews/></ProtectedRoute>} />
            <Route path="/workeranalytics" element={<ProtectedRoute><WorkerAnalytics/></ProtectedRoute>} />
            <Route path="/workerviewjob/:id" element={<ProtectedRoute><WorkerViewJob/></ProtectedRoute>} />

            {/* Customer Pages */}
            <Route path="/customerjobs" element={<ProtectedRoute><CustomerJobs/></ProtectedRoute>} />
            <Route path="/customerjobpost" element={<ProtectedRoute><CustomerJobPost/></ProtectedRoute>} />
            <Route path="/customerorders" element={<ProtectedRoute><CustomerOrders/></ProtectedRoute>} />
            <Route path="/customerpostedjobs" element={<ProtectedRoute><CustomerPostedJobs/></ProtectedRoute>} />
            <Route path="/customerreviews" element={<ProtectedRoute><CustomerReviews/></ProtectedRoute>} />
            <Route path="/customeranalytics" element={<ProtectedRoute><CustomerAnalytics/></ProtectedRoute>} />

            {/* Admin Pages */}
            <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
            <Route path="/admin/jobs" element={<ProtectedRoute><AdminJobs/></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders/></ProtectedRoute>} />
            <Route path="/admin/earnings" element={<ProtectedRoute><AdminEarnings/></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute><AdminReports/></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings/></ProtectedRoute>} />

            {/* Reviewer Pages */}
            <Route path="/reviewer/dashboard" element={<ProtectedRoute><ReviewerDashboard/></ProtectedRoute>} />
            <Route path="/reviewer/jobs" element={<ProtectedRoute><ReviewerJobs/></ProtectedRoute>} />
            <Route path="/reviewer/reports" element={<ProtectedRoute><ReviewerReports/></ProtectedRoute>} />
            <Route path="/reviewer/reviews" element={<ProtectedRoute><ReviewerReviewRequest/></ProtectedRoute>} />
            <Route path="/reviewer/history" element={<ProtectedRoute><ReviewerHistory/></ProtectedRoute>} />

          </Routes>
        </Router>
      </AuthProvider>

    </>
  )
}

export default App
