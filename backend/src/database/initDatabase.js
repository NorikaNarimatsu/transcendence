import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { prefillDatabase } from "./prefillDatabase.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PREFILL_DATABASE = true; // Change to false for production

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
                user2ID              INTEGER,
                user1Score           INTEGER NOT NULL,
                user2Score           INTEGER DEFAULT 0,
                winnerID             INTEGER NOT NULL,
                startedAt            DATETIME NOT NULL DEFAULT (datetime('now')),
                endedAt              DATETIME,
                FOREIGN KEY (user1ID) REFERENCES users(userID),
                FOREIGN KEY (user2ID) REFERENCES users(userID),
                FOREIGN KEY (winnerID) REFERENCES users(userID)
            );
			-- 2FA TABLE
			CREATE TABLE IF NOT EXISTS two_factor_auth (
				codeID		INTEGER PRIMARY KEY AUTOINCREMENT,
				code		TEXT NOT NULL,
				attempts	INTEGER NOT NULL DEFAULT 0,
				userID		INTEGER NOT NULL,
				expiresAt	DATETIME NOT NULL,
				createdAt	DATETIME NOT NULL DEFAULT (datetime('now')),
				used		BOOLEAN NOT NULL DEFAULT 0,
				FOREIGN KEY (userID) REFERENCES users(userID)
			);
        `);
        console.log("Database schema created successfully");
        
        console.log("Creating essential AI and Guest accounts...");
        const insertUser = db.prepare(`
            INSERT INTO users (name, email, password, avatarUrl, createdAt)
            VALUES (?, ?, ?, ?, ?)
        `);

        try {
            const tiePassword = await hashPassword('tie');
			const insertTie = db.prepare(`
				INSERT INTO users (userID, name, email, password, avatarUrl, createdAt)
				VALUES (?, ?, ?, ?, ?, ?)
			`);
			insertTie.run(0, 'TIE', 'tie@gmail.com', tiePassword, '/avatars/AI.jpeg', new Date().toISOString());
            console.log('TIE user created successfully with userID: 0');
            const aiPassword = await hashPassword('ai');
            insertUser.run(
                'AI', 
                'ai@gmail.com', 
                aiPassword, 
                '/avatars/AI.jpeg',
                new Date().toISOString()
            );

            const guestPassword = await hashPassword('guest');
            insertUser.run(
                'Guest', 
                'guest@gmail.com', 
                guestPassword, 
                '/avatars/Guest.jpeg',
                new Date().toISOString()
            );
            console.log('AI and Guest accounts created successfully');
        } catch (error) {
            console.error('Error creating AI/Guest users:', error);
        }
        
        // Conditionally prefill with test data
        if (PREFILL_DATABASE) {
            console.log("PREFILL_DATABASE = true, adding test data...");
            await prefillDatabase(db);
        } else {
            console.log("PREFILL_DATABASE = false, skipping test data");
            console.log("Set PREFILL_DATABASE = true in initDatabase.js to add test data");
        }
    } else {
        console.log("Database tables already exist");
        
        // Check if we should add test data to existing database
        if (PREFILL_DATABASE) {
            const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
            if (userCount <= 2) { // Only AI and Guest exist
                console.log("Adding test data to existing database...");
                await prefillDatabase(db);
            } else {
                console.log(`Database already has ${userCount} users, skipping prefill`);
            }
        }
    }
    return db;
}

