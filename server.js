const express = require("express");
const db = require("./database");

const app = express();

app.use(express.json());

const PORT = 3000;

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

app.get("/tasks", (req, res) => {

    const tasks = db.prepare("SELECT * FROM tasks").all();

    const formatted = tasks.map(task => ({
        id: task.id,
        title: task.title,
        done: Boolean(task.done)
    }));

    res.json(formatted);

});

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});