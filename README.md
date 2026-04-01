# Finance Data Processing and Access Control Backend

A production-grade Node.js + Express + MongoDB backend for a finance dashboard system, featuring role-based access control, financial record management, and aggregated dashboard analytics.

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Runtime | Node.js (v18+) | Async-friendly, familiar |
| Framework | Express.js | Lightweight, flexible routing |
| Database | MongoDB + Mongoose | Document model suits financial records; aggregation pipeline for analytics |
| Auth | JWT (jsonwebtoken) | Stateless, easy to scale |
| Password Hashing | bcryptjs | Industry standard |
| Validation | express-validator | Declarative, chainable rules |
| Rate Limiting | express-rate-limit | Protects auth endpoints |
| Logging | morgan | HTTP request logging |

---

## Project Structure

```
finance-backend/
├── src/
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── models/
│   │   ├── User.js                 # User schema + password hashing
│   │   └── FinancialRecord.js      # Financial record schema
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication
│   │   ├── rbac.js                 # Role-based access control
│   │   └── validate.js             # Validation error handler
│   ├── controllers/
│   │   ├── authController.js       # Register, login, me
│   │   ├── userController.js       # User management (admin)
│   │   ├── recordController.js     # CRUD for financial records
│   │   └── dashboardController.js  # Analytics endpoints
│   ├── services/
│   │   ├── recordService.js        # Record business logic + filtering
│   │   └── dashboardService.js     # MongoDB aggregation pipelines
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── records.js
│   │   └── dashboard.js
│   └── app.js                      # Express app entry point
├── seed.js                         # Demo data seeder
├── Finance_Backend.postman_collection.json
├── .env.example
└── package.json
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone and install
```bash
git clone <your-repo-url>
cd finance-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Seed demo data (optional but recommended)
```bash
node seed.js
```

This creates 3 demo users and 30 sample financial records.

### 4. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:3000`

---

## Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@finance.com | admin123 |
| Analyst | analyst@finance.com | analyst123 |
| Viewer | viewer@finance.com | viewer123 |

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Auth Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login and get JWT |
| GET | `/auth/me` | Any | Get current user info |

**Register**
```json
POST /api/auth/register
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "viewer"
}
```

**Login**
```json
POST /api/auth/login
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "viewer" }
  }
}
```

---

### User Management Routes (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users (paginated) |
| GET | `/users/:id` | Get user by ID |
| PATCH | `/users/:id/role` | Update user role |
| PATCH | `/users/:id/status` | Toggle active/inactive |

**Query Params for GET /users**
- `role` — filter by role (viewer, analyst, admin)
- `isActive` — filter by status (true/false)
- `page`, `limit` — pagination

---

### Financial Records Routes

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/records` | All | List records with filtering |
| GET | `/records/:id` | All | Get single record |
| POST | `/records` | Analyst, Admin | Create record |
| PUT | `/records/:id` | Admin | Update record |
| DELETE | `/records/:id` | Admin | Soft delete record |

**Create Record**
```json
POST /api/records
{
  "amount": 5000,
  "type": "income",
  "category": "salary",
  "date": "2026-04-01",
  "notes": "April salary credit"
}
```

**Supported Categories**
`salary`, `freelance`, `investment`, `rent`, `utilities`, `food`, `transport`, `healthcare`, `entertainment`, `education`, `other`

**Filtering Query Params (GET /records)**
```
?type=expense
?category=food
?startDate=2026-01-01&endDate=2026-04-01
?minAmount=100&maxAmount=5000
?sortBy=date&order=asc
?page=1&limit=10
```

> **Note:** Deletes are soft — records are flagged `isDeleted: true` and excluded from all queries. Data is preserved for auditing.

---

### Dashboard Routes

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/dashboard/summary` | All | Total income, expenses, net balance, recent activity |
| GET | `/dashboard/categories` | Analyst, Admin | Category-wise breakdown |
| GET | `/dashboard/trends/monthly` | Analyst, Admin | Monthly income vs expense |
| GET | `/dashboard/trends/weekly` | Analyst, Admin | Weekly trend data |

**Summary Response**
```json
{
  "summary": {
    "totalIncome": 45200,
    "totalExpenses": 18700,
    "netBalance": 26500,
    "incomeCount": 10,
    "expenseCount": 20,
    "totalRecords": 30
  },
  "recentActivity": [...]
}
```

**Monthly Trends Query Param**
```
?months=6   (default: 6, max: 24)
```

**Weekly Trends Query Param**
```
?weeks=4    (default: 4, max: 12)
```

---

## Role Permissions Summary

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| Login / Register | ✅ | ✅ | ✅ |
| View records | ✅ | ✅ | ✅ |
| Dashboard summary | ✅ | ✅ | ✅ |
| Category breakdown | ❌ | ✅ | ✅ |
| Monthly/weekly trends | ❌ | ✅ | ✅ |
| Create records | ❌ | ✅ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Assign roles | ❌ | ❌ | ✅ |
| Toggle user status | ❌ | ❌ | ✅ |

---

## Error Response Format

All errors follow a consistent format:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    { "field": "email", "message": "Valid email is required" }
  ]
}
```

### HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request / invalid input |
| 401 | Unauthenticated (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 422 | Validation failed |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Assumptions Made

1. **Analyst can create records but not edit/delete** — Analysts are data entry operators, not supervisors.
2. **Soft delete only** — Records are never permanently removed. `isDeleted: true` is set instead.
3. **Admins cannot change their own role or deactivate themselves** — Prevents lockout scenarios.
4. **JWT is stateless** — No token blacklist/refresh flow implemented (out of scope).
5. **All monetary amounts are in a single currency** — Currency conversion is out of scope.
6. **Timestamps are in UTC** — Standard for backend systems.

---

## Optional Enhancements Included

- ✅ JWT Authentication
- ✅ Pagination on records and users
- ✅ Soft delete with `deletedAt` timestamp
- ✅ Rate limiting (global + auth-specific)
- ✅ Seed script with demo data
- ✅ Postman collection
- ✅ MongoDB indexes for query performance

---

## Postman Collection

Import `Finance_Backend.postman_collection.json` into Postman.

The collection includes:
- Auto-saves tokens after login via test scripts
- Pre-configured requests for all endpoints
- Includes role-violation test cases (e.g. viewer trying to create a record)

---

## Deployment (Render)

1. Push repo to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set environment variables (same as `.env`)
4. Build command: `npm install`
5. Start command: `npm start`

Use MongoDB Atlas as the cloud database.

---

## Author

**Swa Omm Tripathy**  
Backend Developer Intern Assignment — Zorvyn FinTech Pvt. Ltd.
