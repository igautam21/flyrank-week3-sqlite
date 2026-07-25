const Database = require("better-sqlite3");

// Open (or create) the database
const db = new Database("tasks.db");

// Create tasks table
db.prepare(`
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
)
`).run();

// Check if table is empty
const count = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();

if (count.count === 0) {
    const insert = db.prepare(
        "INSERT INTO tasks (title, done) VALUES (?, ?)"
    );

    insert.run("Learn Express", 0);
    insert.run("Complete FlyRank Assignment", 0);
    insert.run("Push Code to GitHub", 1);

    console.log("Initial tasks inserted.");
}

module.exports = db;