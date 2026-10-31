# Week 3 SQLite CRUD API

A CRUD Task API built with:

- Express.js
- SQLite (better-sqlite3)
- Swagger UI

## Installation

```bash
npm install
node server.js
```

## API Documentation

http://localhost:3000/docs

## Endpoints

- GET /tasks
- GET /tasks/:id
- POST /tasks
- PUT /tasks/:id
- DELETE /tasks/:id

## Stage 0: PostgreSQL with Docker

Started a PostgreSQL 17 container using Docker.

- Container name: taskdb
- Database: tasks
- PostgreSQL user: postgres
- Port: 5432
- Persistent volume: taskdata
- Container data path: /var/lib/postgresql/data

### Verification

Verified the running container using:

```bash
docker ps