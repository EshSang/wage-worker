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

          </Routes>
        </Router>
      </AuthProvider>

    </>
  )
}

export default App
