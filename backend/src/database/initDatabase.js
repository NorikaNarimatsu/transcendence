import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js"; // where comparePassword is used? Did i mistakenly overwrite? @Gosia

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initializeDatabase() {
    const databaseFolderPath = __dirname;
    if (!fs.existsSync(databaseFolderPath)) {
        fs.mkdirSync(databaseFolderPath, { recursive: true });
        console.log("Database folder created at:", databaseFolderPath);
    }
    const db = new Database(path.join(databaseFolderPath, "transcendence.db"));
    const tableExists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='users';`).get();
    if (!tableExists) {
        db.exec(`
            -- USERS TABLE
            CREATE TABLE IF NOT EXISTS users (
                userID      INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT UNIQUE NOT NULL,
                email       TEXT UNIQUE NOT NULL,
                password    TEXT NOT NULL,
                avatarUrl   TEXT NOT NULL,
                createdAt   DATETIME NOT NULL,
                lastLoginAt DATETIME NOT NULL DEFAULT (datetime('now')),
                lang        TEXT NOT NULL DEFAULT 'en',
                "2FA"       BOOLEAN NOT NULL DEFAULT 0
            );
            -- FRIENDS TABLE
            CREATE TABLE IF NOT EXISTS friends (
                friendID     INTEGER PRIMARY KEY AUTOINCREMENT,
                user1ID      INTEGER NOT NULL,
                user2ID      INTEGER NOT NULL,
                registeredAt DATETIME NOT NULL,
                FOREIGN KEY (user1ID) REFERENCES users(userID),
                FOREIGN KEY (user2ID) REFERENCES users(userID)
            );
            -- MATCH TABLE
            CREATE TABLE IF NOT EXISTS match (
                matchID              INTEGER PRIMARY KEY AUTOINCREMENT,
                matchType            TEXT NOT NULL,
                matchMode            TEXT NOT NULL,
                tournamentBracketID  INTEGER,
                tournamentMatchID    INTEGER,
                user1ID              INTEGER NOT NULL,
                user2ID              INTEGER NOT NULL,
                user1Score           INTEGER NOT NULL,
                user2Score           INTEGER NOT NULL,
                winnerID             INTEGER NOT NULL,
                FOREIGN KEY (user1ID) REFERENCES users(userID),
                FOREIGN KEY (user2ID) REFERENCES users(userID),
                FOREIGN KEY (winnerID) REFERENCES users(userID)
            );
        `);
        console.log("Users table created successfully");
        
        const avatars = [
            '/avatars/Avatar_1.png', '/avatars/Avatar_2.png',
            '/avatars/Avatar_3.png', '/avatars/Avatar_4.png',
            '/avatars/Avatar_5.png', '/avatars/Avatar_6.png',
            '/avatars/Avatar_7.png', '/avatars/Avatar_8.png',
            '/avatars/Avatar_9.png'
        ];
        // Create 10 test users
        const insertUser = db.prepare(`
            INSERT INTO users (name, email, password, avatarUrl, createdAt)
            VALUES (?, ?, ?, ?, ?)
        `);
        for (let i = 1; i <= 10; i++) {
            const name = `test${i}`;
            const email = `test${i}@gmail.com`;
            const password = `test${i}`; // Same as username
            const hashpassword = await hashPassword(password);
            const randomAvatarUrl = avatars[Math.floor(Math.random() * avatars.length)];
            const createdAt = new Date().toISOString();
            try {
                insertUser.run(name, email, hashpassword, randomAvatarUrl, createdAt);
                console.log(`Test user ${name} created successfully with avatar: ${randomAvatarUrl}`);
            } catch (error) {
                console.error(`Error creating test user ${name}:`, error);
            }
        }
        console.log("All test users created successfully");
    } else {
        console.log("Users table already exists");
    }
    return db;
}

