const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const express = require("express");
const db = require("./database");

const app = express();

app.use(express.json());

const PORT = 3000;

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Task API",
            version: "2.0",
            description: "SQLite CRUD API"
        },
        servers: [
            {
                url: `http://localhost:${PORT}`
            }
        ]
    },
    apis: ["./server.js"]
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
    res.json({
        name: "Task API",
        version: "2.0",
        database: "SQLite",
        endpoints: [
            "/tasks",
            "/tasks/:id"
        ]
    });
});

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: List of tasks
 */

app.get("/tasks", (req, res) => {

    const tasks = db.prepare("SELECT * FROM tasks").all();

    const formatted = tasks.map(task => ({
        id: task.id,
        title: task.title,
        done: Boolean(task.done)
    }));

    res.json(formatted);

});

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get one task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Task not found
 */

app.get("/tasks/:id", (req, res) => {

    const id = Number(req.params.id);

    const task = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(id);

    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    res.json({
        id: task.id,
        title: task.title,
        done: Boolean(task.done)
    });

});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 */

app.post("/tasks", (req, res) => {

    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    const result = db
        .prepare("INSERT INTO tasks (title, done) VALUES (?, ?)")
        .run(title, 0);

    const newTask = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(result.lastInsertRowid);

    res.status(201).json({
        id: newTask.id,
        title: newTask.title,
        done: Boolean(newTask.done)
    });

});

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               done:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated
 */

// Update task
app.put("/tasks/:id", (req, res) => {

    const id = Number(req.params.id);

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    const { title, done } = req.body;

    const newTitle = title !== undefined ? title : task.title;
    const newDone = done !== undefined ? (done ? 1 : 0) : task.done;

    db.prepare(`
        UPDATE tasks
        SET title = ?, done = ?
        WHERE id = ?
    `).run(newTitle, newDone, id);

    const updatedTask = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(id);

    res.json({
        id: updatedTask.id,
        title: updatedTask.title,
        done: Boolean(updatedTask.done)
    });

});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted
 */

// Delete task
app.delete("/tasks/:id", (req, res) => {

    const id = Number(req.params.id);

    const result = db
        .prepare("DELETE FROM tasks WHERE id = ?")
        .run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    res.status(204).send();

});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});