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
                user2ID              INTEGER,
                user1Score           INTEGER NOT NULL,
                user2Score           INTEGER DEFAULT 0,
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

        try {
            const tiePassword = await hashPassword('tie');
            db.exec(`INSERT INTO users (userID, name, email, password, avatarUrl, createdAt) 
                        VALUES (0, 'TIE', 'tie@gmail.com', '${tiePassword}', '/avatars/AI.jpeg', '${new Date().toISOString()}')`);
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
            console.log('AI and Guest accounts are created successfully with userID: 1');
        } catch (error) {
            console.error('Error creating AI user:', error);
        }
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

        const insertMatch = db.prepare(`
            INSERT INTO match (matchType, matchMode, user1ID, user2ID, user1Score, user2Score, winnerID)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const pongMatches = [
            // Single player matches (vs AI - userID 1)
            { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 3, user2Score: 1, winnerID: 3 },
            { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 2, user2Score: 3, winnerID: 1 },
            { matchType: 'pong', matchMode: 'single', user1ID: 4, user2ID: 1, user1Score: 3, user2Score: 0, winnerID: 4 },
            { matchType: 'pong', matchMode: 'single', user1ID: 4, user2ID: 1, user1Score: 1, user2Score: 3, winnerID: 1 },
            { matchType: 'pong', matchMode: 'single', user1ID: 5, user2ID: 1, user1Score: 3, user2Score: 2, winnerID: 5 },
            { matchType: 'pong', matchMode: 'single', user1ID: 6, user2ID: 1, user1Score: 0, user2Score: 3, winnerID: 1 },
            { matchType: 'pong', matchMode: 'single', user1ID: 7, user2ID: 1, user1Score: 3, user2Score: 1, winnerID: 7 },
            { matchType: 'pong', matchMode: 'single', user1ID: 8, user2ID: 1, user1Score: 2, user2Score: 3, winnerID: 1 },

            // 2-player matches (vs Guest - userID 2)
            { matchType: 'pong', matchMode: '2players', user1ID: 3, user2ID: 2, user1Score: 3, user2Score: 1, winnerID: 3 },
            { matchType: 'pong', matchMode: '2players', user1ID: 4, user2ID: 2, user1Score: 1, user2Score: 3, winnerID: 2 },
            { matchType: 'pong', matchMode: '2players', user1ID: 5, user2ID: 2, user1Score: 3, user2Score: 2, winnerID: 5 },
            { matchType: 'pong', matchMode: '2players', user1ID: 6, user2ID: 2, user1Score: 0, user2Score: 3, winnerID: 2 },

            // 2-player matches (user vs user)
            { matchType: 'pong', matchMode: '2players', user1ID: 3, user2ID: 4, user1Score: 3, user2Score: 2, winnerID: 3 },
            { matchType: 'pong', matchMode: '2players', user1ID: 5, user2ID: 6, user1Score: 2, user2Score: 3, winnerID: 6 },
            { matchType: 'pong', matchMode: '2players', user1ID: 7, user2ID: 8, user1Score: 3, user2Score: 0, winnerID: 7 },
            { matchType: 'pong', matchMode: '2players', user1ID: 9, user2ID: 10, user1Score: 1, user2Score: 3, winnerID: 10 },
            { matchType: 'pong', matchMode: '2players', user1ID: 11, user2ID: 12, user1Score: 3, user2Score: 1, winnerID: 11 },
            { matchType: 'pong', matchMode: '2players', user1ID: 3, user2ID: 5, user1Score: 3, user2Score: 2, winnerID: 3 },
            { matchType: 'pong', matchMode: '2players', user1ID: 4, user2ID: 7, user1Score: 1, user2Score: 3, winnerID: 7 },
            { matchType: 'pong', matchMode: '2players', user1ID: 6, user2ID: 8, user1Score: 3, user2Score: 1, winnerID: 6 },

            // More single player matches
            { matchType: 'pong', matchMode: 'single', user1ID: 9, user2ID: 1, user1Score: 3, user2Score: 2, winnerID: 9 },
            { matchType: 'pong', matchMode: 'single', user1ID: 10, user2ID: 1, user1Score: 0, user2Score: 3, winnerID: 1 },
            { matchType: 'pong', matchMode: 'single', user1ID: 11, user2ID: 1, user1Score: 3, user2Score: 1, winnerID: 11 },
            { matchType: 'pong', matchMode: 'single', user1ID: 12, user2ID: 1, user1Score: 2, user2Score: 3, winnerID: 1 },

            // More 2-player matches
            { matchType: 'pong', matchMode: '2players', user1ID: 7, user2ID: 2, user1Score: 3, user2Score: 0, winnerID: 7 },
            { matchType: 'pong', matchMode: '2players', user1ID: 8, user2ID: 2, user1Score: 2, user2Score: 3, winnerID: 2 },
            { matchType: 'pong', matchMode: '2players', user1ID: 9, user2ID: 2, user1Score: 3, user2Score: 1, winnerID: 9 },
            { matchType: 'pong', matchMode: '2players', user1ID: 10, user2ID: 2, user1Score: 1, user2Score: 3, winnerID: 2 }
        ];

        console.log("Adding fake Pong match data...");
        for (const match of pongMatches) {
            try {
                insertMatch.run(
                    match.matchType,
                    match.matchMode,
                    match.user1ID,
                    match.user2ID,
                    match.user1Score,
                    match.user2Score,
                    match.winnerID
                );
            } catch (error) {
                console.error(`Error inserting match:`, error);
            }
        }
        console.log(`${pongMatches.length} fake Pong matches added successfully`);

    } else {
        console.log("Users table already exists");
    }





    return db;
}

