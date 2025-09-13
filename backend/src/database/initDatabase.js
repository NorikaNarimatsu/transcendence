import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initializeDatabase() {

    // Ensure the `database/db` folder exists
    const databaseFolderPath = path.join(__dirname, "db");
    if (!fs.existsSync(databaseFolderPath)) {
        fs.mkdirSync(databaseFolderPath, { recursive: true });
        console.log("Database folder created at:", databaseFolderPath);
    }

    const db = new Database(path.join(databaseFolderPath, "transcendence.db"));

    const tableExists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='items';`).get();

    if (!tableExists) {
    db.exec(`
        CREATE TABLE items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL
        );
    `);
    }
    return db;
}

