# Wage Worker Management System - Documentation

## Overview

This project is a **Wage Worker Management System (WWMS)** - a full-stack web application that connects service providers (workers) with customers who need services.

**Project Type**: Full-stack web application
**Purpose**: Connect workers (service providers) with customers who need services
**Tech Stack**: React + Vite (Frontend), Node.js + Express (Backend), MySQL + Prisma (Database)

---

## 📚 Documentation

Complete documentation is available in the [`.claude/`](./.claude/) directory:

### 📊 [Database Structure](./.claude/database-structure.md)
Complete database schema documentation including:
- Entity-Relationship Diagrams (ERD)
- Table structures with field details
- Relationships between tables
- Enum types and constraints
- Database configuration
- Seeding information
- Design decisions

**Tables Documented**: User, JobCategory, Job, JobApplication, Order, Review

---

### 🔧 [Backend Structure](./.claude/backend-structure.md)
Backend architecture and API documentation including:
- Project structure and file organization
- MVC architecture pattern
- Complete API endpoint documentation
- Request/Response examples
- Authentication and authorization
- Middleware configuration
- Service layer functions
- Error handling
- Security features

**API Modules**: Authentication, Jobs, Applications, Categories

---

### 🎨 [Frontend Structure](./.claude/frontend-structure.md)
Frontend architecture and component documentation including:
- React component hierarchy
- Routing configuration
- State management (Context API)
- Page components with features
- Axios configuration and interceptors
- UI/UX patterns
- Styling approach
- Environment configuration

**Key Components**: Authentication, Worker pages, Customer pages, Shared components

---

### 🚀 [Features and Flows](./.claude/features-and-flows.md)
Implemented features and user flows including:
- Feature-by-feature breakdown
- User flow diagrams
- Data flow architecture
- Business rules
- API security
- Feature status (implemented vs. placeholder)
- Next steps for development

**Implemented Features**:
1. User Authentication System
2. Worker - Browse and Search Jobs
3. Worker - View Job Details and Apply
4. Worker - View Application Status
5. Customer - Post New Job
6. Customer - View and Manage Applications

---

### 📋 [Project Summary](./.claude/project-summary.md)
High-level project overview including:
- Technology stack summary
- Architecture overview
- Implementation status
- Quick stats
- Development roadmap
- Known issues and limitations

---

### 📝 [TODO Context](./.claude/todo-context.md)
Planned features and implementation roadmap:
- 16 planned tasks with detailed implementation plans
- Task numbering for easy reference (Task #1, Task #2, etc.)
- Database, backend, and frontend changes for each task
- Dependencies and priority levels
- Recommended implementation order

**⚠️ IMPORTANT RULE**:
When implementing a task from `todo-context.md`:
1. Reference the task by number (e.g., "Implement Task #12")
2. Follow the implementation plan in the TODO file
3. After completion, **REMOVE** the task from `todo-context.md`
4. **UPDATE** the following files with the implemented feature:
   - `.claude/database-structure.md` (if database changes)
   - `.claude/backend-structure.md` (if API/backend changes)
   - `.claude/frontend-structure.md` (if components added)
   - `.claude/features-and-flows.md` (add feature documentation)
   - `.claude/project-summary.md` (update status and stats)
5. Keep `todo-context.md` containing ONLY upcoming/planned features

---

## Quick Start

### Prerequisites
```bash
Node.js >= 16
MySQL >= 8.0
npm or yarn
```

### Installation
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Database Setup
```bash
cd server

# Create .env file with DATABASE_URL
echo "DATABASE_URL=\"mysql://user:pass@localhost:3306/wage_worker_db\"" > .env
echo "JWT_SECRET=\"your_secret_key\"" >> .env

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

### Development
```bash
# From root directory - runs both frontend and backend
npm run dev

# OR run separately:

# Terminal 1 - Backend (port 8081)
cd server
npm start

# Terminal 2 - Frontend (port 5173)
cd client
npm run dev
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    WWMS Architecture                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐      ┌───────┐ │
│  │   Frontend   │      │   Backend    │      │  DB   │ │
│  │  React+Vite  │◄────►│ Express+Node │◄────►│ MySQL │ │
│  │   Port 5173  │ HTTP │  Port 8081   │Prisma│       │ │
│  └──────────────┘      └──────────────┘      └───────┘ │
│                                                          │
│  Authentication: JWT (Bearer Token)                      │
│  API Communication: Axios with Interceptors              │
│  State Management: React Context API                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
wage-worker/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/              # Axios configuration
│   │   ├── Components/       # Reusable components
│   │   ├── context/          # Context providers
│   │   ├── Pages/            # Page components
│   │   │   ├── Auth/
│   │   │   ├── Worker/
│   │   │   ├── Customer/
│   │   │   └── Common/
│   │   ├── App.jsx           # Main app with routes
│   │   └── main.jsx          # Entry point
│   └── package.json
│
├── server/                    # Backend (Node.js + Express)
│   ├── config/               # Configuration files
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Auth, logging, etc.
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── prisma/               # Database schema & seeds
│   ├── server.js             # Entry point
│   └── package.json
│
├── .claude/                   # Project Documentation
│   ├── database-structure.md
│   ├── backend-structure.md
│   ├── frontend-structure.md
│   ├── features-and-flows.md
│   └── project-summary.md
│
├── README.md                  # This file
└── package.json               # Root package (concurrently)
```

---

## Key Technologies

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **UI Library**: React Bootstrap + Bootstrap 5
- **HTTP Client**: Axios
- **State**: Context API
- **Notifications**: React Toastify
- **Icons**: React Icons, Bootstrap Icons, Lucide

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v5
- **ORM**: Prisma Client
- **Database**: MySQL
- **Authentication**: JWT + bcrypt
- **Logging**: Morgan
- **CORS**: Enabled

### Database
- **DBMS**: MySQL
- **ORM**: Prisma
- **Migrations**: Prisma Migrate
- **Seeding**: Custom seed scripts

---

## User Roles

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Worker** | Service provider | Browse jobs, Apply for jobs, View application status |
| **Customer** | Service requester | Post jobs, View applications, Accept/Reject applications |
| **Admin** | System administrator | (Defined in schema, not implemented) |
| **Reviewer** | Review manager | (Defined in schema, not implemented) |

---

## API Base URLs

- **Development Backend**: `http://localhost:8081/api`
- **Development Frontend**: `http://localhost:5173`

---

## Authentication Flow

```
1. User Signs In → POST /api/auth/signin
2. Server validates credentials
3. Server generates JWT token
4. Token sent to client
5. Client stores token in localStorage
6. Client includes token in all API requests (Authorization: Bearer <token>)
7. Server validates token via middleware
8. Token expires after 1 hour → Auto logout
```

---

## Database Relationships

```
User (1) ─────< Job (N)
User (1) ─────< JobApplication (N)
User (1) ─────< Order (N)
User (1) ─────< Review (N)

JobCategory (1) ─────< Job (N)

Job (1) ─────< JobApplication (N)
Job (1) ─────< Order (N)

JobApplication (1) ─────< Order (N)

Order (1) ─────< Review (N)
```

---

## Implemented vs. Planned Features

### ✅ Fully Implemented
- ✅ User registration and login
- ✅ JWT authentication
- ✅ Worker: Browse and search jobs
- ✅ Worker: View job details
- ✅ Worker: Apply for jobs
- ✅ Worker: View application status
- ✅ Customer: Post new jobs
- ✅ Customer: View applications
- ✅ Customer: Accept/Reject applications

### ⚠️ Partially Implemented (UI only, no backend binding)
- ⚠️ Customer: View/Edit/Delete posted jobs
- ⚠️ Worker: My Services
- ⚠️ Worker: Earnings tracking
- ⚠️ Worker & Customer: Reviews
- ⚠️ Worker & Customer: Analytics dashboards
- ⚠️ User profile management (UI exists)

### ❌ Not Implemented
- ❌ Order management system
- ❌ Review and rating system
- ❌ Admin panel
- ❌ Email notifications
- ❌ Real-time updates
- ❌ File uploads
- ❌ Payment integration
- ❌ Chat/messaging

---

## Environment Variables

### Server (.env)
```env
PORT=8081
DATABASE_URL="mysql://user:password@localhost:3306/wage_worker_db"
JWT_SECRET="your_secret_key_here"
JWT_EXPIRES_IN="1h"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

### Client (.env)
```env
VITE_API_URL=http://localhost:8081
```

---

## Common API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/profile` 🔒 - Get user profile
- `PUT /api/auth/profile` 🔒 - Update profile

### Jobs
- `GET /api/jobs` 🔒 - Get all jobs
- `POST /api/jobs` 🔒 - Create job (Customer)
- `GET /api/jobs/my-jobs` 🔒 - Get user's posted jobs

### Applications
- `POST /api/applications` 🔒 - Apply for job (Worker)
- `GET /api/applications/my-applications` 🔒 - Get worker's applications
- `GET /api/applications/my-jobs` 🔒 - Get applications for customer's jobs
- `PATCH /api/applications/:id/status` 🔒 - Update application status (Customer)

### Categories
- `GET /api/categories` - Get all job categories

🔒 = Requires JWT authentication

---

## Security Considerations

1. **Passwords**: Hashed using bcrypt (10 salt rounds)
2. **Tokens**: JWT with 1-hour expiry
3. **Authorization**: Route-level and resource-level checks
4. **CORS**: Configured for specific origins
5. **Input Validation**: Both client and server-side
6. **SQL Injection**: Protected by Prisma ORM
7. **XSS**: Protected by React auto-escaping

---

## Testing

**Current Status**: No automated tests implemented

**Recommended Testing**:
- Unit tests: Jest + React Testing Library
- API tests: Supertest
- E2E tests: Cypress or Playwright
- Database tests: Prisma test environment

---

## Known Issues & Limitations

1. **CustomerPostedJobs**: UI only, no backend integration
2. **Profile Update**: UI exists but limited implementation
3. **Order System**: Database schema exists but no implementation
4. **Reviews**: Database schema exists but no implementation
5. **File Uploads**: Not implemented
6. **Pagination**: Not implemented for large datasets
7. **Real-time Updates**: Not implemented
8. **Email Notifications**: Not implemented

---

## Future Enhancements

### Phase 1 - Complete Core Features
- Implement CustomerPostedJobs (edit/delete)
- Complete Order system workflow
- Build Review and Rating system
- Add user profile editing

### Phase 2 - Enhance UX
- Add pagination
- Implement real-time notifications
- Add file upload for worker portfolio
- Build analytics dashboards

### Phase 3 - Advanced Features
- Email notifications
- SMS notifications
- Payment integration
- Chat/messaging system
- Admin panel
- Mobile app (React Native)

---

## How to Use This Documentation

1. **For New Developers**:
   - Start with this README
   - Read [.claude/features-and-flows.md](./.claude/features-and-flows.md) to understand what's implemented
   - Review [.claude/database-structure.md](./.claude/database-structure.md) for data models
   - Check [.claude/backend-structure.md](./.claude/backend-structure.md) for API details
   - See [.claude/frontend-structure.md](./.claude/frontend-structure.md) for component structure

2. **For Feature Development**:
   - Check [.claude/features-and-flows.md](./.claude/features-and-flows.md) for current implementation status
   - Review related API endpoints in [.claude/backend-structure.md](./.claude/backend-structure.md)
   - Check database schema in [.claude/database-structure.md](./.claude/database-structure.md)
   - Update documentation after implementing new features

3. **For Bug Fixes**:
   - Identify affected component/API from error
   - Check relevant documentation file in `.claude/` directory
   - Trace data flow from frontend → backend → database
   - Update documentation if bug was due to outdated docs

4. **For API Integration**:
   - Reference [.claude/backend-structure.md](./.claude/backend-structure.md) for endpoint details
   - Check authentication requirements
   - Review request/response formats
   - Test with provided examples

---

## Documentation Maintenance Checklist

When making changes to the project, update documentation in `.claude/` directory:

- [ ] Database schema changed → Update `.claude/database-structure.md`
- [ ] New API endpoint → Update `.claude/backend-structure.md`
- [ ] New component/page → Update `.claude/frontend-structure.md`
- [ ] New feature completed → Update `.claude/features-and-flows.md`
- [ ] Architecture change → Update all relevant files
- [ ] Environment variable added → Update this README

---

## Glossary

- **Worker**: Service provider who applies for jobs
- **Customer**: Service requester who posts jobs
- **Job**: Work opportunity posted by customer
- **Application**: Worker's submission to a job
- **Order**: Accepted application (becomes work order)
- **Review**: Rating and feedback for completed work
- **JWT**: JSON Web Token for authentication
- **ORM**: Object-Relational Mapping (Prisma)
- **MVC**: Model-View-Controller architecture pattern

---

## Contact Information

**Developer**: Eshana
**Project**: Wage Worker Management System
**Last Updated**: 2025-12-27

---

## License

(Add license information here)
