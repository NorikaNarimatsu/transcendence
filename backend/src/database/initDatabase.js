import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { v4 as uuidv4 } from 'uuid'; //delete later

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initializeDatabase() {

    const databaseFolderPath = __dirname;
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
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                avatarUrl TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // add table for other parts
        console.log("Items table created successfully");
        
        // Avatar array for random selection
        const avatars = [
            '/avatars/Avatar_1.png',
            '/avatars/Avatar_2.png',
            '/avatars/Avatar_3.png',
            '/avatars/Avatar_4.png',
            '/avatars/Avatar_5.png',
            '/avatars/Avatar_6.png',
            '/avatars/Avatar_7.png',
            '/avatars/Avatar_8.png',
            '/avatars/Avatar_9.png'
        ];

        // Insert 10 test users
        const insertUser = db.prepare(`
            INSERT INTO items (uuid, name, email, password, avatarUrl)
            VALUES (?, ?, ?, ?, ?)
        `);

        // Create 10 test users with random avatars
        for (let i = 1; i <= 10; i++) {
            const uuid = uuidv4();
            const name = `test${i}`;
            const email = `test${i}@gmail.com`;
            const password = `test${i}`; // Same as username
            const randomAvatarUrl = avatars[Math.floor(Math.random() * avatars.length)];

            try {
                insertUser.run(uuid, name, email, password, randomAvatarUrl);
                console.log(`Test user ${name} created successfully with avatar: ${randomAvatarUrl}`);
            } catch (error) {
                console.error(`Error creating test user ${name}:`, error);
            }
        }

        console.log("All test users created successfully");
    } else {
        console.log("Items table already exists");
    }
    return db;
}

