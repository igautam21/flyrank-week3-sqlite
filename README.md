
# FlyRank Backend Assignment – Containerized Task API

A RESTful Task Management API built with Node.js, Express.js, PostgreSQL, and Docker. This project demonstrates CRUD operations, database persistence, and containerized deployment using Docker Compose.

## Tech Stack

- Node.js 22
- Express.js
- PostgreSQL 17
- pg (node-postgres)
- Docker
- Docker Compose
- Swagger UI

## Features

- Create, read, update, and delete tasks.
- PostgreSQL database integration.
- Parameterized SQL queries to prevent SQL injection.
- Automatic database table creation.
- Initial task seeding when the table is empty.
- Input validation and proper HTTP status codes.
- Persistent PostgreSQL storage using Docker volumes.
- Swagger API documentation.

## Project Structure

```text
flyrank-week3-sqlite/
├── repository/
│   └── taskRepository.js
├── database.js
├── server.js
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── package.json
└── README.md
```

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgres://postgres:your_password@localhost:5432/tasks
POSTGRES_PASSWORD=your_password
```

Use the same password for both variables.

Never commit your actual `.env` file. Use `.env.example` as a template.

## Run with Docker Compose

### Prerequisites

- Docker Desktop
- Docker Compose

### Start the application

```bash
docker compose up --build -d
```

This starts:
- PostgreSQL database on port 5432.
- Express API on port 3000.

The API waits for PostgreSQL to become healthy before starting.

### Check containers

```bash
docker compose ps
```

### View API logs

```bash
docker compose logs api
```

### Stop containers

```bash
docker compose down
```

PostgreSQL data is stored in the named Docker volume `taskdata` and persists after containers are removed.

To start again:

```bash
docker compose up -d
```

Do not use `docker compose down -v` if you want to preserve database data.

## API Documentation

Swagger UI:

http://localhost:3000/docs

## API Endpoints

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| GET | /tasks | Get all tasks | 200 |
| GET | /tasks/:id | Get a task by ID | 200 |
| POST | /tasks | Create a task | 201 |
| PUT | /tasks/:id | Update a task | 200 |
| DELETE | /tasks/:id | Delete a task | 204 |

Error responses:
- 400 – Invalid input
- 404 – Task not found
- 500 – Internal server error

## Example API Requests

### Get all tasks

```bash
curl -i http://localhost:3000/tasks
```

### Get a task by ID

```bash
curl -i http://localhost:3000/tasks/1
```

### Create a task

```bash
curl -i -X POST http://localhost:3000/tasks \
-H "Content-Type: application/json" \
-d '{"title":"Learn Docker"}'
```

### Update a task

```bash
curl -i -X PUT http://localhost:3000/tasks/1 \
-H "Content-Type: application/json" \
-d '{"title":"Learn PostgreSQL","done":true}'
```

### Delete a task

```bash
curl -i -X DELETE http://localhost:3000/tasks/1
```

## Database Persistence

PostgreSQL data is stored in a named Docker volume:

`taskdata`

The volume is mounted at:

`/var/lib/postgresql/data`

Data persistence was verified by stopping and recreating the Docker Compose containers and confirming that the original tasks remained available.

## License

ISC

