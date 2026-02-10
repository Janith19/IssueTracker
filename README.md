# Issue Tracker

A full-stack issue tracking application built with React, Express.js, and MongoDB.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Express.js + TypeScript
- **Database:** MongoDB (via Mongoose)
- **Auth:** JWT (httpOnly cookies) + bcrypt
- **State Management:** Zustand

## Features

- **CRUD Operations** — Create, view, edit, and delete issues
- **Issue Details** — Title, description, severity, priority, status
- **Status Tracking** — Open, In Progress, Resolved, Closed with live counts
- **Search & Filter** — Search by title, filter by status and priority (debounced API calls)
- **Pagination** — Server-side pagination with page controls
- **Visual Indicators** — Color-coded badges for status, severity, and priority
- **Export** — Download issue list as CSV or JSON
- **Authentication** — Register, login, logout with secure JWT cookies
- **Confirmation Prompts** — Before deleting or marking issues as Resolved/Closed

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Atlas or local instance)

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd IssueTracker
```

### 2. Backend

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

The backend runs on `http://localhost:5000`.

### 3. Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## API Endpoints

### Authentication

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| POST   | `/api/auth/register` | Register a new user          |
| POST   | `/api/auth/login`    | Login and receive JWT cookie |
| POST   | `/api/auth/logout`   | Logout and clear cookie      |

### Issues (requires authentication)

| Method | Endpoint          | Description                                                                        |
| ------ | ----------------- | ---------------------------------------------------------------------------------- |
| GET    | `/api/issues`     | List issues (supports `title`, `status`, `priority`, `page`, `limit` query params) |
| GET    | `/api/issues/:id` | Get a single issue                                                                 |
| POST   | `/api/issues`     | Create a new issue                                                                 |
| PUT    | `/api/issues/:id` | Update an issue                                                                    |
| DELETE | `/api/issues/:id` | Delete an issue                                                                    |

## Project Structure

```
IssueTracker/
├── Backend/
│   └── src/
│       ├── config/        # Database connection
│       ├── controllers/   # Route handlers
│       ├── middleware/     # JWT auth middleware
│       ├── models/        # Mongoose schemas
│       ├── routes/        # API routes
│       └── index.ts       # Express app entry
└── Frontend/
    └── src/
        ├── components/    # Reusable components (ProtectedRoute)
        ├── IssuePage/     # Issue list & detail pages
        ├── LoginPage/     # Login page
        ├── Register/      # Registration page
        ├── store/         # Zustand stores (auth, issues)
        ├── types/         # TypeScript interfaces
        ├── utils/         # Axios API instance
        └── App.tsx        # Routes & app shell
```

## Usage

1. Register a new account at `/register`
2. Sign in at `/login`
3. Create, search, filter, edit, and delete issues from the dashboard
4. Click an issue title to view its full details
5. Export your issues as CSV or JSON using the toolbar buttons
