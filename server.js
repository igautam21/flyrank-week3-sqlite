
require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const taskRepository = require("./repository/taskRepository");
const authRoutes = require("./server/routes/authRoutes");
const authenticateUser = require("./server/middleware/authMiddleware");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ==========================================
// SWAGGER CONFIGURATION
// ==========================================

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Task API",
            version: "4.0",
            description:
                "PostgreSQL CRUD API with Supabase Authentication and JWT Protection"
        },

        servers: [
            {
                url: `http://localhost:${PORT}`
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter your Supabase access token"
                }
            }
        }
    },

    apis: [
        "./server.js",
        "./server/routes/*.js"
    ]
};

const swaggerSpec = swaggerJsdoc(options);

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.json({
        name: "Task API",
        version: "4.0",
        database: "PostgreSQL",
        authentication: "Supabase",
        endpoints: [
            "/tasks",
            "/tasks/:id",
            "/auth/signup",
            "/auth/login",
            "/auth/logout",
            "/docs"
        ]
    });
});

// ==========================================
// AUTHENTICATION ROUTES (PUBLIC)
// ==========================================

app.use("/auth", authRoutes);

// ==========================================
// TASK API ROUTES (PROTECTED)
// ==========================================

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized access
 */

app.get("/tasks", authenticateUser, async (req, res, next) => {
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
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task found
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Task not found
 */

app.get("/tasks/:id", authenticateUser, async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const task = await taskRepository.getTaskById(id);

        if (!task) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
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
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Complete assignment
 *     responses:
 *       201:
 *         description: Task created
 *       401:
 *         description: Unauthorized access
 */

app.post("/tasks", authenticateUser, async (req, res, next) => {
    try {
        const { title } = req.body;

        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                error: "Title is required"
            });
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
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
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
 *         description: Task updated
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Task not found
 */

app.put("/tasks/:id", authenticateUser, async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const existingTask = await taskRepository.getTaskById(id);

        if (!existingTask) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
        }

        const { title, done } = req.body;

        if (
            title !== undefined &&
            (typeof title !== "string" || !title.trim())
        ) {
            return res.status(400).json({
                error: "Title must be a non-empty string"
            });
        }

        if (done !== undefined && typeof done !== "boolean") {
            return res.status(400).json({
                error: "Done must be a boolean"
            });
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
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Task deleted
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Task not found
 */

app.delete("/tasks/:id", authenticateUser, async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const deletedTask = await taskRepository.deleteTask(id);

        if (!deletedTask) {
            return res.status(404).json({
                error: `Task ${id} not found`
            });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// ==========================================
// CENTRAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        error: "Internal server error"
    });
});

// ==========================================
// START SERVER
// ==========================================

async function startServer() {
    try {
        await taskRepository.initializeDatabase();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log("Supabase authentication routes enabled");
            console.log(`Swagger documentation: http://localhost:${PORT}/docs`);
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
