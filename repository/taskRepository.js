
const pool = require("../database");

// Create the tasks table and seed initial data if empty
async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            done BOOLEAN NOT NULL DEFAULT FALSE
        )
    `);

    const result = await pool.query(
        "SELECT COUNT(*) FROM tasks"
    );

    if (Number(result.rows[0].count) === 0) {
        await pool.query(`
            INSERT INTO tasks (title, done)
            VALUES
                ($1, $2),
                ($3, $4),
                ($5, $6)
        `, [
            "Learn Express", false,
            "Complete FlyRank Assignment", false,
            "Push Code to GitHub", true
        ]);

        console.log("Initial tasks inserted.");
    }
}

// Get all tasks
async function getAllTasks() {
    const result = await pool.query(
        "SELECT * FROM tasks ORDER BY id"
    );
    return result.rows;
}

// Get task by ID
async function getTaskById(id) {
    const result = await pool.query(
        "SELECT * FROM tasks WHERE id = $1",
        [id]
    );
    return result.rows[0];
}

// Create task
async function createTask(title) {
    const result = await pool.query(
        "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
        [title]
    );
    return result.rows[0];
}

// Update task
async function updateTask(id, title, done) {
    const result = await pool.query(
        `UPDATE tasks
         SET title = $1, done = $2
         WHERE id = $3
         RETURNING *`,
        [title, done, id]
    );
    return result.rows[0];
}

// Delete task
async function deleteTask(id) {
    const result = await pool.query(
        "DELETE FROM tasks WHERE id = $1 RETURNING *",
        [id]
    );
    return result.rows[0];
}

module.exports = {
    initializeDatabase,
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};
