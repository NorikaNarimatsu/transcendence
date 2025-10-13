import { hashPassword } from "../utils/passwordUtils.js";

export async function prefillDatabase(db) {
    console.log("Starting database prefill with test data...");

    const avatars = [
        '/avatars/Avatar_1.png', '/avatars/Avatar_2.png',
        '/avatars/Avatar_3.png', '/avatars/Avatar_4.png',
        '/avatars/Avatar_5.png', '/avatars/Avatar_6.png',
        '/avatars/Avatar_7.png', '/avatars/Avatar_8.png',
        '/avatars/Avatar_9.png'
    ];

    // REMOVED: AI and Guest creation (now handled in initDatabase)
    // Create test users only (test1-test15 for more data variety)
    console.log("Creating test users...");
    const insertUser = db.prepare(`
        INSERT INTO users (name, email, password, avatarUrl, createdAt)
        VALUES (?, ?, ?, ?, ?)
    `);

    for (let i = 1; i <= 15; i++) {
        const name = `test${i}`;
        const email = `test${i}@gmail.com`;
        const password = `test${i}`;
        const hashpassword = await hashPassword(password);
        const randomAvatarUrl = avatars[Math.floor(Math.random() * avatars.length)];
        const createdAt = new Date().toISOString();

        try {
            insertUser.run(name, email, hashpassword, randomAvatarUrl, createdAt);
            console.log(`Test user ${name} created with avatar: ${randomAvatarUrl}`);
        } catch (error) {
            console.error(`Error creating test user ${name}:`, error);
        }
    }

    // Create friendships for social features
    console.log("Adding friendships...");
    const insertFriend = db.prepare(`
        INSERT INTO friends (user1ID, user2ID, registeredAt)
        VALUES (?, ?, ?)
    `);

    const friendships = [
        { user1ID: 3, user2ID: 4 }, // test1 and test2
        { user1ID: 3, user2ID: 5 }, // test1 and test3
        { user1ID: 3, user2ID: 6 }, // test1 and test4
        { user1ID: 4, user2ID: 5 }, // test2 and test3
        { user1ID: 4, user2ID: 7 }, // test2 and test5
        { user1ID: 5, user2ID: 8 }, // test3 and test6
        { user1ID: 6, user2ID: 9 }, // test4 and test7
        { user1ID: 7, user2ID: 10 }, // test5 and test8
    ];

    for (const friendship of friendships) {
        try {
            insertFriend.run(friendship.user1ID, friendship.user2ID, new Date().toISOString());
        } catch (error) {
            console.error('Error creating friendship:', error);
        }
    }
    console.log(`${friendships.length} friendships created`);

    // Comprehensive match data
    console.log("Adding comprehensive match data...");
    const insertMatch = db.prepare(`
        INSERT INTO match (matchType, matchMode, user1ID, user2ID, user1Score, user2Score, winnerID, startedAt, endedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Generate realistic match timing data
    const generateMatchTiming = (daysAgo, baseMinutes = 2) => {
        const now = new Date();
        const matchDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        
        // Add some random variation to the time (0-23 hours)
        const randomHours = Math.floor(Math.random() * 24);
        const randomMinutes = Math.floor(Math.random() * 60);
        matchDate.setHours(randomHours, randomMinutes, 0, 0);
        
        const startedAt = matchDate.toISOString();
        
        // Match duration: base + random variation (1-10 minutes for pong, 2-15 for snake)
        const durationMinutes = baseMinutes + Math.floor(Math.random() * (baseMinutes * 3));
        const endedAt = new Date(matchDate.getTime() + (durationMinutes * 60 * 1000)).toISOString();
        
        return { startedAt, endedAt };
    };

    // Generate matches for test1 (userID: 3) - Main test user with lots of data
    const test1Matches = [
        // Pong matches - creating win streaks and variety
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 3, user2Score: 0, winnerID: 3, daysAgo: 0, baseMinutes: 3 }, // Perfect game
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 3, user2Score: 1, winnerID: 3, daysAgo: 1, baseMinutes: 3 }, // Win
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 3, user2Score: 2, winnerID: 3, daysAgo: 2, baseMinutes: 3 }, // Win
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 3, user2Score: 0, winnerID: 3, daysAgo: 3, baseMinutes: 3 }, // Perfect game
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 3, user2Score: 1, winnerID: 3, daysAgo: 4, baseMinutes: 3 }, // Win (5 win streak!)
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 2, user2Score: 3, winnerID: 1, daysAgo: 5, baseMinutes: 3 }, // Loss (breaks streak)
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 3, user2Score: 2, winnerID: 3, daysAgo: 6, baseMinutes: 3 }, // Win
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 1, user2Score: 3, winnerID: 1, daysAgo: 7, baseMinutes: 3 }, // Loss
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 3, user2Score: 0, winnerID: 3, daysAgo: 8, baseMinutes: 3 }, // Perfect game
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 3, user2Score: 2, winnerID: 3, daysAgo: 9, baseMinutes: 3 }, // Win
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 3, user2Score: 1, winnerID: 3, daysAgo: 10, baseMinutes: 3 }, // Win
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 3, user2Score: 0, winnerID: 3, daysAgo: 11, baseMinutes: 3 }, // Perfect game
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 3, user2Score: 1, winnerID: 3, daysAgo: 12, baseMinutes: 3 }, // Current win streak: 4

        // 2-player pong matches
        { matchType: 'pong', matchMode: '2players', user1ID: 3, user2ID: 2, user1Score: 3, user2Score: 1, winnerID: 3, daysAgo: 13, baseMinutes: 4 },
        { matchType: 'pong', matchMode: '2players', user1ID: 3, user2ID: 4, user1Score: 3, user2Score: 2, winnerID: 3, daysAgo: 14, baseMinutes: 4 },
        { matchType: 'pong', matchMode: '2players', user1ID: 3, user2ID: 5, user1Score: 2, user2Score: 3, winnerID: 5, daysAgo: 15, baseMinutes: 4 },
        { matchType: 'pong', matchMode: '2players', user1ID: 3, user2ID: 6, user1Score: 3, user2Score: 0, winnerID: 3, daysAgo: 16, baseMinutes: 4 }, // Perfect
        { matchType: 'pong', matchMode: '2players', user1ID: 3, user2ID: 7, user1Score: 1, user2Score: 3, winnerID: 7, daysAgo: 17, baseMinutes: 4 },
        { matchType: 'pong', matchMode: '2players', user1ID: 3, user2ID: 8, user1Score: 3, user2Score: 2, winnerID: 3, daysAgo: 18, baseMinutes: 4 },

        // Snake single player matches - no opponent (user2ID = null)
        { matchType: 'snake', matchMode: 'single', user1ID: 3, user2ID: null, user1Score: 150, user2Score: 0, winnerID: 3, daysAgo: 19, baseMinutes: 8 },
        { matchType: 'snake', matchMode: 'single', user1ID: 3, user2ID: null, user1Score: 89, user2Score: 0, winnerID: 3, daysAgo: 20, baseMinutes: 8 },
        { matchType: 'snake', matchMode: 'single', user1ID: 3, user2ID: null, user1Score: 220, user2Score: 0, winnerID: 3, daysAgo: 21, baseMinutes: 8 },
        { matchType: 'snake', matchMode: 'single', user1ID: 3, user2ID: null, user1Score: 167, user2Score: 0, winnerID: 3, daysAgo: 22, baseMinutes: 8 },
        
        // Snake 2-player matches (vs Guest or other users)
        { matchType: 'snake', matchMode: '2players', user1ID: 3, user2ID: 2, user1Score: 180, user2Score: 160, winnerID: 3, daysAgo: 23, baseMinutes: 12 },
        { matchType: 'snake', matchMode: '2players', user1ID: 3, user2ID: 4, user1Score: 140, user2Score: 170, winnerID: 4, daysAgo: 24, baseMinutes: 12 },
        { matchType: 'snake', matchMode: '2players', user1ID: 3, user2ID: 5, user1Score: 200, user2Score: 180, winnerID: 3, daysAgo: 25, baseMinutes: 12 },

        // Additional matches to reach different achievement tiers
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 3, user2Score: 1, winnerID: 3, daysAgo: 26, baseMinutes: 3 },
        { matchType: 'pong', matchMode: 'single', user1ID: 3, user2ID: 1, user1Score: 3, user2Score: 2, winnerID: 3, daysAgo: 27, baseMinutes: 3 },
        { matchType: 'snake', matchMode: 'single', user1ID: 3, user2ID: null, user1Score: 190, user2Score: 0, winnerID: 3, daysAgo: 28, baseMinutes: 8 },
        { matchType: 'pong', matchMode: '2players', user1ID: 3, user2ID: 9, user1Score: 3, user2Score: 1, winnerID: 3, daysAgo: 29, baseMinutes: 4 },
        { matchType: 'snake', matchMode: '2players', user1ID: 3, user2ID: 10, user1Score: 170, user2Score: 150, winnerID: 3, daysAgo: 30, baseMinutes: 12 },
    ];

    // Matches for other users to create variety
    const otherMatches = [
        // test2 (userID: 4) matches
        { matchType: 'pong', matchMode: 'single', user1ID: 4, user2ID: 1, user1Score: 3, user2Score: 2, winnerID: 4, daysAgo: 0, baseMinutes: 3 },
        { matchType: 'pong', matchMode: 'single', user1ID: 4, user2ID: 1, user1Score: 1, user2Score: 3, winnerID: 1, daysAgo: 1, baseMinutes: 3 },
        { matchType: 'pong', matchMode: 'single', user1ID: 4, user2ID: 1, user1Score: 3, user2Score: 0, winnerID: 4, daysAgo: 2, baseMinutes: 3 },
        { matchType: 'pong', matchMode: '2players', user1ID: 4, user2ID: 2, user1Score: 2, user2Score: 3, winnerID: 2, daysAgo: 3, baseMinutes: 4 },
        { matchType: 'snake', matchMode: 'single', user1ID: 4, user2ID: null, user1Score: 160, user2Score: 0, winnerID: 4, daysAgo: 4, baseMinutes: 8 },

        // test3 (userID: 5) matches
        { matchType: 'pong', matchMode: 'single', user1ID: 5, user2ID: 1, user1Score: 3, user2Score: 1, winnerID: 5, daysAgo: 5, baseMinutes: 3 },
        { matchType: 'pong', matchMode: 'single', user1ID: 5, user2ID: 1, user1Score: 2, user2Score: 3, winnerID: 1, daysAgo: 6, baseMinutes: 3 },
        { matchType: 'pong', matchMode: '2players', user1ID: 5, user2ID: 6, user1Score: 3, user2Score: 2, winnerID: 5, daysAgo: 7, baseMinutes: 4 },
        { matchType: 'snake', matchMode: 'single', user1ID: 5, user2ID: null, user1Score: 200, user2Score: 0, winnerID: 5, daysAgo: 8, baseMinutes: 8 },

        // test4 (userID: 6) matches - a user with mostly losses
        { matchType: 'pong', matchMode: 'single', user1ID: 6, user2ID: 1, user1Score: 1, user2Score: 3, winnerID: 1, daysAgo: 9, baseMinutes: 3 },
        { matchType: 'pong', matchMode: 'single', user1ID: 6, user2ID: 1, user1Score: 0, user2Score: 3, winnerID: 1, daysAgo: 10, baseMinutes: 3 },
        { matchType: 'pong', matchMode: 'single', user1ID: 6, user2ID: 1, user1Score: 2, user2Score: 3, winnerID: 1, daysAgo: 11, baseMinutes: 3 },
        { matchType: 'pong', matchMode: '2players', user1ID: 6, user2ID: 2, user1Score: 1, user2Score: 3, winnerID: 2, daysAgo: 12, baseMinutes: 4 },
        { matchType: 'pong', matchMode: '2players', user1ID: 6, user2ID: 7, user1Score: 3, user2Score: 1, winnerID: 6, daysAgo: 13, baseMinutes: 4 }, // One win

        // High-performing user (test5 - userID: 7) - for leaderboard variety
        { matchType: 'pong', matchMode: 'single', user1ID: 7, user2ID: 1, user1Score: 3, user2Score: 0, winnerID: 7, daysAgo: 14, baseMinutes: 3 },
        { matchType: 'pong', matchMode: 'single', user1ID: 7, user2ID: 1, user1Score: 3, user2Score: 1, winnerID: 7, daysAgo: 15, baseMinutes: 3 },
        { matchType: 'pong', matchMode: 'single', user1ID: 7, user2ID: 1, user1Score: 3, user2Score: 0, winnerID: 7, daysAgo: 16, baseMinutes: 3 },
        { matchType: 'pong', matchMode: 'single', user1ID: 7, user2ID: 1, user1Score: 3, user2Score: 1, winnerID: 7, daysAgo: 17, baseMinutes: 3 },
        { matchType: 'pong', matchMode: 'single', user1ID: 7, user2ID: 1, user1Score: 3, user2Score: 2, winnerID: 7, daysAgo: 18, baseMinutes: 3 },
        { matchType: 'pong', matchMode: '2players', user1ID: 7, user2ID: 2, user1Score: 3, user2Score: 0, winnerID: 7, daysAgo: 19, baseMinutes: 4 },
        { matchType: 'snake', matchMode: 'single', user1ID: 7, user2ID: null, user1Score: 300, user2Score: 0, winnerID: 7, daysAgo: 20, baseMinutes: 8 },

        // More variety matches
        { matchType: 'snake', matchMode: '2players', user1ID: 8, user2ID: 9, user1Score: 180, user2Score: 160, winnerID: 8, daysAgo: 21, baseMinutes: 12 },
        { matchType: 'pong', matchMode: '2players', user1ID: 9, user2ID: 10, user1Score: 3, user2Score: 2, winnerID: 9, daysAgo: 22, baseMinutes: 4 },
        { matchType: 'snake', matchMode: 'single', user1ID: 10, user2ID: null, user1Score: 140, user2Score: 0, winnerID: 10, daysAgo: 23, baseMinutes: 8 },
        { matchType: 'pong', matchMode: 'single', user1ID: 11, user2ID: 1, user1Score: 3, user2Score: 1, winnerID: 11, daysAgo: 24, baseMinutes: 3 },
        { matchType: 'snake', matchMode: '2players', user1ID: 12, user2ID: 13, user1Score: 200, user2Score: 190, winnerID: 12, daysAgo: 25, baseMinutes: 12 },
    ];

    // Combine all matches
    const allMatches = [...test1Matches, ...otherMatches];

    // Insert all matches
    for (const match of allMatches) {
        try {
            const timing = generateMatchTiming(match.daysAgo, match.baseMinutes);
            
            insertMatch.run(
                match.matchType,
                match.matchMode,
                match.user1ID,
                match.user2ID,
                match.user1Score,
                match.user2Score,
                match.winnerID,
                timing.startedAt,
                timing.endedAt
            );
            
            const duration = Math.round((new Date(timing.endedAt) - new Date(timing.startedAt)) / 1000 / 60);
            console.log(`Created ${match.matchType} match: ${match.user1Score}-${match.user2Score} (${duration}min)`);
        } catch (error) {
            console.error(`Error inserting match:`, error);
        }
    }

    console.log(`${allMatches.length} matches added successfully`);
}