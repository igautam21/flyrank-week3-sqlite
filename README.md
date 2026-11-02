# FlyRank Task API – Authentication & Authorization

A RESTful Task Management API built using Node.js, Express.js, PostgreSQL and Supabase Authentication. This project implements user signup, login, logout, JWT verification, and protected API routes.

## Features

- User registration using Supabase Auth.
- User login with email and password.
- Password recovery through email.
- User logout and application-level token revocation.
- JWT-based authentication middleware.
- Protected user profile endpoint.
- Public information endpoint.
- Protected Task CRUD endpoints.
- PostgreSQL database integration.
- Swagger UI API documentation.
- Docker and Docker Compose support.
- Persistent PostgreSQL storage using Docker volumes.

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express.js | REST API framework |
| PostgreSQL | Database |
| Supabase Auth | User authentication |
| JWT | Token-based authorization |
| pg | PostgreSQL client |
| Swagger | API documentation |
| Docker | Containerization |
| Docker Compose | Multi-container management |

## Project Structure

```text
flyrank-week3-sqlite/
│
├── config/
│   └── supabase.js
│
├── repository/
│   └── taskRepository.js
│
├── server/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   └── authRoutes.js
│   └── utils/
│       └── tokenBlacklist.js
│
├── public/
│   └── reset-password.html
│
├── .env
├── .env.example
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/igautam21/flyrank-week3-sqlite.git
cd flyrank-week3-sqlite
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_NAME=tasks

SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_publishable_key
```

Replace the placeholder values with your own configuration.

**Important:** Never commit your `.env` file or expose your Supabase keys. Use `.env.example` as a configuration reference.

### 4. Start PostgreSQL

If using Docker Compose:

```bash
docker compose up -d
```

### 5. Start the backend

```bash
node server.js
```

The server runs at:

```text
http://localhost:3000
```

## API Endpoints

### Authentication APIs

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/auth/signup` | Register a new user | Not required |
| POST | `/auth/login` | Login an existing user | Not required |
| POST | `/auth/logout` | Logout and revoke the current token | Required |

### Protected and Public APIs

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/protected/profile` | Get authenticated user profile | Required |
| GET | `/public/info` | Get public information | Not required |

### Task APIs

All task endpoints require a valid Bearer access token.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get a task by ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

## Authentication Flow

1. A user registers using the signup endpoint.
2. Supabase Auth creates the user account.
3. The user logs in using email and password.
4. Supabase returns an access token.
5. The client sends the token in the Authorization header.
6. Authentication middleware verifies the token using `supabase.auth.getUser(token)`.
7. Protected endpoints become accessible after successful verification.
8. On logout, the application adds the token to its denylist and performs the Supabase logout operation.
9. Subsequent requests using the revoked token are rejected.

### Authorization Header

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Example Signup Request

```http
POST /auth/signup
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "StrongPass@123"
}
```

### Example Login Request

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

### Example Protected Profile Response

```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "id": "USER_ID",
    "email": "user@example.com",
    "created_at": "TIMESTAMP"
  }
}
```

## HTTP Response Codes

| Status Code | Description |
|---|---|
| 200 OK | Successful login or data retrieval |
| 201 Created | Successful user registration |
| 204 No Content | Successful logout |
| 400 Bad Request | Missing or invalid required input |
| 401 Unauthorized | Missing, invalid, expired or revoked token, or invalid login credentials |
| 500 Internal Server Error | Unexpected server-side error |

## Swagger API Documentation

Interactive API documentation is available at:

```text
http://localhost:3000/docs
```

Swagger UI supports:

- Viewing all available API endpoints.
- Testing signup and login.
- Authorizing requests using JWT Bearer tokens.
- Testing protected profile and task operations.
- Viewing API request and response details.

### Swagger Screenshot

Add a screenshot of the Swagger UI here after capturing the complete endpoint list.

## Security Implementation

- Supabase handles user authentication.
- JWT access tokens are verified using Supabase.
- Reusable authentication middleware protects multiple endpoints.
- Requests without valid tokens receive HTTP 401.
- Logged-out tokens are rejected using an application-level denylist.
- Environment variables are used for sensitive configuration.
- Public endpoints remain accessible without authentication.

**Note:** The current token denylist uses an in-memory JavaScript `Set`. It resets when the server restarts and is intended for demonstration purposes. Production deployments should use persistent revocation storage with token-expiry handling.

## Testing

The APIs were tested using Postman and Swagger UI.

| Test Case | Expected Result | Result |
|---|---|---|
| Successful signup | 201 Created | Passed |
| Successful login | 200 OK | Passed |
| Public information endpoint | 200 OK | Passed |
| Profile without authentication | 401 Unauthorized | Passed |
| Profile with valid token | 200 OK | Passed |
| Profile with invalid token | 401 Unauthorized | Passed |
| Successful logout | 204 No Content | Passed |
| Reuse revoked token | 401 Unauthorized | Passed |
| Swagger Bearer authorization | 200 OK | Passed |

## Author

**Gautam**

GitHub: https://github.com/igautam21

---

**Project:** FlyRank Backend AI Engineering Internship – Authentication Assignment
