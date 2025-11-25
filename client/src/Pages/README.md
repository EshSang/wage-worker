# Pages Directory Structure

This directory contains all page components organized by feature/user type for better maintainability.

## Directory Organization

```
Pages/
├── Auth/           # Authentication pages
│   ├── SignIn.jsx
│   └── SignUp.jsx
│
├── Common/         # Shared pages accessible to all users
│   ├── Home.jsx
│   └── UserProfile.jsx
│
├── Customer/       # Customer-specific pages
│   ├── CustomerAnalytics.jsx
│   ├── CustomerJobPost.jsx
│   ├── CustomerJobs.jsx
│   ├── CustomerOrders.jsx
│   ├── CustomerPostedJobs.jsx
│   └── CustomerReviews.jsx
│
└── Worker/         # Worker-specific pages
    ├── WorkerAnalytics.jsx
    ├── WorkerEarning.jsx
    ├── WorkerJobs.jsx
    ├── WorkerMyService.jsx
    ├── WorkerOrders.jsx
    ├── WorkerReviews.jsx
    └── WorkerViewJob.jsx
```

## Folder Descriptions

### 📁 Auth/
Contains authentication-related pages:
- **SignIn.jsx** - User login page
- **SignUp.jsx** - User registration page

### 📁 Common/
Contains pages accessible by all user types:
- **Home.jsx** - User type selection page (Worker/Customer)
- **UserProfile.jsx** - User profile management page

### 📁 Customer/
Contains customer-specific functionality:
- **CustomerJobs.jsx** - Browse available jobs
- **CustomerJobPost.jsx** - Create new job postings
- **CustomerPostedJobs.jsx** - View posted jobs
- **CustomerOrders.jsx** - Manage orders
- **CustomerReviews.jsx** - View/manage reviews
- **CustomerAnalytics.jsx** - View analytics dashboard

### 📁 Worker/
Contains worker-specific functionality:
- **WorkerJobs.jsx** - Browse available jobs
- **WorkerViewJob.jsx** - View detailed job information
- **WorkerMyService.jsx** - Manage services offered
- **WorkerOrders.jsx** - View/manage orders
- **WorkerEarning.jsx** - Track earnings
- **WorkerReviews.jsx** - View reviews
- **WorkerAnalytics.jsx** - View analytics dashboard

## Import Usage

### In App.jsx or other files:

```javascript
// Auth Pages
import SignIn from './Pages/Auth/SignIn';
import SignUp from './Pages/Auth/SignUp';

// Common Pages
import Home from './Pages/Common/Home';
import UserProfile from './Pages/Common/UserProfile';

// Customer Pages
import CustomerJobs from './Pages/Customer/CustomerJobs';
import CustomerJobPost from './Pages/Customer/CustomerJobPost';
// ... other customer pages

// Worker Pages
import WorkerJobs from './Pages/Worker/WorkerJobs';
import WorkerViewJob from './Pages/Worker/WorkerViewJob';
// ... other worker pages
```

## Benefits of This Structure

1. **Better Organization** - Related pages are grouped together
2. **Easier Navigation** - Clear separation by feature/user type
3. **Improved Maintainability** - Easier to find and update specific pages
4. **Scalability** - Easy to add new pages to appropriate folders
5. **Clear Architecture** - Developers can quickly understand project structure

## Adding New Pages

When adding a new page, place it in the appropriate folder:

- **Authentication features** → `Auth/`
- **Shared functionality** → `Common/`
- **Customer features** → `Customer/`
- **Worker features** → `Worker/`

Example:
```javascript
// Adding a new customer page
// File: Pages/Customer/CustomerPayments.jsx
import CustomerPayments from './Pages/Customer/CustomerPayments';
```

## Page Count Summary

- **Auth:** 2 pages
- **Common:** 2 pages
- **Customer:** 6 pages
- **Worker:** 7 pages
- **Total:** 17 pages

---

*Last Updated: November 2025*
