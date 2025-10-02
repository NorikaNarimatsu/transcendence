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
                XP          INTEGER NOT NULL DEFAULT 0,
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
        // add table for other parts
        console.log("Users table created successfully");
        
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

        const insertUser = db.prepare(`
            INSERT INTO users (name, email, password, avatarUrl, createdAt)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (let i = 1; i <= 10; i++) {
            const name = `test${i}`;
            const email = `test${i}@gmail.com`;
            const password = `test${i}`;
            const randomAvatarUrl = avatars[Math.floor(Math.random() * avatars.length)];
            const createdAt = new Date().toISOString();

            try {
                insertUser.run(name, email, password, randomAvatarUrl, createdAt);
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



// -- USERS TABLE
// CREATE TABLE IF NOT EXISTS  users (
// id         INTEGER PRIMARY KEY AUTOINCREMENT,
// userID     TEXT UNIQUE NOT NULL,
// name   TEXT NOT NULL,
// email      TEXT UNIQUE NOT NULL,
// password   TEXT NOT NULL,
// avatarUrl  TEXT,
// createdAt  DATETIME NOT NULL
// );
// -- FRIENDS TABLE (friendship between two users)
// CREATE TABLE IF NOT EXISTS  friends (
// id           INTEGER PRIMARY KEY AUTOINCREMENT,
// user1ID      TEXT NOT NULL,
// user2ID      TEXT NOT NULL,
// registeredAt DATETIME NOT NULL,
// UNIQUE(user1ID, user2ID),
// FOREIGN KEY (user1ID) REFERENCES users(userID),
// FOREIGN KEY (user2ID) REFERENCES users(userID)
// );
// -- FRIEND REQUEST TABLE
// CREATE TABLE IF NOT EXISTS  friendRequest (
// id          INTEGER PRIMARY KEY AUTOINCREMENT,
// requestID   TEXT UNIQUE NOT NULL,
// fromUserID  TEXT NOT NULL,
// toUserID    TEXT NOT NULL,
// status      TEXT NOT NULL CHECK (status IN (‘pending’, ‘accepted’, ‘declined’)),
// createdAt   DATETIME NOT NULL,
// modifiedAt  DATETIME,
// FOREIGN KEY (fromUserID) REFERENCES users(userID),
// FOREIGN KEY (toUserID) REFERENCES users(userID)
// );
// -- LOGIN TABLE
// CREATE TABLE IF NOT EXISTS  login (
// id        INTEGER PRIMARY KEY AUTOINCREMENT,
// userID    TEXT NOT NULL,
// loginAt   DATETIME NOT NULL,
// logoutAt  DATETIME,
// FOREIGN KEY (userID) REFERENCES users(userID)
// );
// -- MATCH TABLE
// CREATE TABLE IF NOT EXISTS  match (
// id            INTEGER PRIMARY KEY AUTOINCREMENT,
// matchID       TEXT UNIQUE NOT NULL,
// matchType     TEXT NOT NULL,
// matchMode     TEXT NOT NULL,
// player1ID     TEXT NOT NULL,
// player2ID     TEXT NOT NULL,
// player1Score  INTEGER NOT NULL,
// player2Score  INTEGER NOT NULL,
// winnerID      TEXT NOT NULL,
// startedAt     DATETIME NOT NULL,
// endedAt       DATETIME,
// FOREIGN KEY (player1ID) REFERENCES users(userID),
// FOREIGN KEY (player2ID) REFERENCES users(userID),
// FOREIGN KEY (winnerID) REFERENCES users(userID)
// );
// -- PREFERENCE TABLE
// CREATE TABLE IF NOT EXISTS  preference (
// id         INTEGER PRIMARY KEY AUTOINCREMENT,
// userID     TEXT NOT NULL,
// language   TEXT,
// difficulty TEXT,
// FOREIGN KEY (userID) REFERENCES users(userID)
// );
