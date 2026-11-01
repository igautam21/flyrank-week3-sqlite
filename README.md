
# FlyRank Task API – Authentication & Authorization

A RESTful Task Management API built using Node.js, Express.js, PostgreSQL and Supabase Authentication. The project implements user signup, login, logout, JWT verification and protected API routes.

## Features

- User registration using Supabase Auth.
- User login with email and password.
- Password recovery through email.
- User logout and application-level token revocation.
- JWT-based authentication middleware.
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

**Important:** Never commit your `.env` file or expose your Supabase keys.

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

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Login an existing user |
| POST | `/auth/logout` | Logout and revoke the current token |

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
6. Authentication middleware verifies the token with Supabase.
7. Protected task endpoints become accessible.
8. On logout, the application adds the token to its denylist.

### Authorization Header

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
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

## Swagger API Documentation

Interactive API documentation is available at:

```text
http://localhost:3000/docs
```

Swagger supports:
- Viewing all available endpoints.
- Testing signup and login.
- Authorizing requests using JWT Bearer tokens.
- Testing protected task operations.
- Viewing API request and response details.

## Security Implementation

- Supabase handles user authentication.
- JWT access tokens are verified using Supabase.
- Authentication middleware protects task endpoints.
- Requests without valid tokens receive HTTP 401.
- Logged-out tokens are rejected using an application-level denylist.
- Environment variables are used for sensitive configuration.

**Note:** The current token denylist uses an in-memory JavaScript Set. It resets when the server restarts and is intended for demonstration purposes. Production deployments should use persistent revocation storage with token-expiry handling.

## Testing

The APIs were tested using Postman and Swagger UI.

| Test | Expected Result |
|---|---|
| Successful signup | 201 Created |
| Successful login | 200 OK |
| Missing authentication token | 401 Unauthorized |
| Valid token accessing tasks | 200 OK |
| Successful logout | 200 OK |
| Revoked token accessing tasks | 401 Unauthorized |

## Author

**Gautam**

GitHub: https://github.com/igautam21

---

**Project:** FlyRank Backend AI Engineering Internship – Authentication Assignment
