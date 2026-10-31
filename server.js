
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const express = require("express");

const taskRepository = require("./repository/taskRepository");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Task API",
            version: "3.0",
            description: "PostgreSQL CRUD API"
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
        version: "3.0",
        database: "PostgreSQL",
        endpoints: ["/tasks", "/tasks/:id"]
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
app.get("/tasks", async (req, res, next) => {
    try {
        const tasks = await taskRepository.getAllTasks();
        res.json(tasks);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get one task
 */
app.get("/tasks/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "Invalid task ID" });
        }

        const task = await taskRepository.getTaskById(id);

        if (!task) {
            return res.status(404).json({ error: `Task ${id} not found` });
        }

        res.json(task);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a task
 */
app.post("/tasks", async (req, res, next) => {
    try {
        const { title } = req.body;

        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({ error: "Title is required" });
        }

        const newTask = await taskRepository.createTask(title.trim());
        res.status(201).json(newTask);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 */
app.put("/tasks/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "Invalid task ID" });
        }

        const existingTask = await taskRepository.getTaskById(id);

        if (!existingTask) {
            return res.status(404).json({ error: `Task ${id} not found` });
        }

        const { title, done } = req.body;

        if (title !== undefined &&
            (typeof title !== "string" || !title.trim())) {
            return res.status(400).json({ error: "Title must be a non-empty string" });
        }

        if (done !== undefined && typeof done !== "boolean") {
            return res.status(400).json({ error: "Done must be a boolean" });
        }

        const updatedTask = await taskRepository.updateTask(
            id,
            title !== undefined ? title.trim() : existingTask.title,
            done !== undefined ? done : existingTask.done
        );

        res.json(updatedTask);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 */
app.delete("/tasks/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "Invalid task ID" });
        }

        const deletedTask = await taskRepository.deleteTask(id);

        if (!deletedTask) {
            return res.status(404).json({ error: `Task ${id} not found` });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Central error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

// Initialize database before starting API
async function startServer() {
    try {
        await taskRepository.initializeDatabase();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
