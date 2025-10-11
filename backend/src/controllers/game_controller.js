import { initializeDatabase } from "../database/initDatabase.js";
// Change this line - import the class
import { sanitizeInput } from "../utils/sanitizeInput.js";

const db = await initializeDatabase();

// Add a new match result
export const addMatch = async (request, response) => {
    console.log("=== addMatch called ===");
    console.log("Request body:", request.body);
    
    try {
        const { 
            matchType,      // 'pong' or 'snake'
            matchMode,      // 'single', '2players', 'tournament'
            user1Name,      // Player 1 name
            user2Name,      // Player 2 name (can be 'Guest' for single player)
            user1Score,     // Player 1 final score
            user2Score,     // Player 2 final score
            tournamentBracketID = null,
            tournamentMatchID = null
        } = request.body;

        console.log("Extracted values:", { matchType, matchMode, user1Name, user2Name, user1Score, user2Score });

        // Validate required fields
        if (!matchType || !matchMode || !user1Name || user1Score === undefined || user2Score === undefined) {
            console.log("Validation failed - missing required fields");
            return response.code(400).send({ 
                message: "Missing required fields: matchType, matchMode, user1Name, user1Score, user2Score" 
            });
        }

        console.log("Validation passed, sanitizing inputs...");

        // Sanitize inputs - use class methods
        const sanitizedMatchType = sanitizeInput.sanitizeUsername(matchType);
        const sanitizedMatchMode = sanitizeInput.sanitizeUsername(matchMode);
        const sanitizedUser1Name = sanitizeInput.sanitizeUsername(user1Name);
        const sanitizedUser2Name = sanitizeInput.sanitizeUsername(user2Name || 'Guest');

        console.log("Sanitized values:", { sanitizedMatchType, sanitizedMatchMode, sanitizedUser1Name, sanitizedUser2Name });

        // Get user IDs
        console.log("Looking up user1:", sanitizedUser1Name);
        const user1 = db.prepare("SELECT userID FROM users WHERE name = ?").get(sanitizedUser1Name);
        console.log("User1 result:", user1);
        
        if (!user1) {
            console.log("User1 not found");
            return response.code(404).send({ message: `User ${sanitizedUser1Name} not found` });
        }

        // Replace the user2ID section (around lines 55-70) with this:
        let user2ID;
        if (sanitizedUser2Name === 'Guest' || sanitizedUser2Name === 'guest') {
            console.log("User2 is Guest, looking up Guest user...");
            
            // First, try to find existing Guest user
            let guestUser = db.prepare("SELECT userID FROM users WHERE name = ?").get('Guest');
            
            if (!guestUser) {
                console.log("Guest user not found, creating one...");
                // Create Guest user if it doesn't exist
                const createGuest = db.prepare(`
                    INSERT INTO users (name, email, password, avatarUrl, createdAt, lastLoginAt) 
                    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
                `);
                
                try {
                    const result = createGuest.run('Guest', 'guest@system.local', 'no-password', '/avatars/Avatar_guest.png');
                    user2ID = result.lastInsertRowid;
                    console.log("Created Guest user with ID:", user2ID);
                } catch (error) {
                    console.error("Error creating Guest user:", error);
                    return response.code(500).send({ message: "Failed to create Guest user" });
                }
            } else {
                user2ID = guestUser.userID;
                console.log("Found existing Guest user with ID:", user2ID);
            }
        } else {
            console.log("Looking up user2:", sanitizedUser2Name);
            const user2 = db.prepare("SELECT userID FROM users WHERE name = ?").get(sanitizedUser2Name);
            console.log("User2 result:", user2);
            
            if (!user2) {
                console.log("User2 not found");
                return response.code(404).send({ message: `User ${sanitizedUser2Name} not found` });
            }
            user2ID = user2.userID;
        }

        console.log("Final user2ID:", user2ID);

        // Determine winner - update this section too
        let winnerID;
        if (user1Score > user2Score) {
            winnerID = user1.userID;
        } else if (user2Score > user1Score) {
            winnerID = user2ID; // Now user2ID is always a valid user ID
        } else {
            winnerID = user1.userID; // Default to user1 for ties
        }

        console.log("Winner determined:", { winnerID, user1Score, user2Score });

        // Insert match into database
        console.log("Preparing to insert match...");
        const insertMatch = db.prepare(`
            INSERT INTO match (
                matchType, matchMode, tournamentBracketID, tournamentMatchID,
                user1ID, user2ID, user1Score, user2Score, winnerID
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        console.log("Insert parameters:", [
            sanitizedMatchType,
            sanitizedMatchMode, 
            tournamentBracketID,
            tournamentMatchID,
            user1.userID,
            user2ID,
            parseInt(user1Score),
            parseInt(user2Score),
            winnerID
        ]);

        const result = insertMatch.run(
            sanitizedMatchType,
            sanitizedMatchMode,
            tournamentBracketID,
            tournamentMatchID,
            user1.userID,
            user2ID,
            parseInt(user1Score),
            parseInt(user2Score),
            winnerID
        );

        console.log("Insert successful:", result);

        return response.code(201).send({
            message: "Match saved successfully",
            matchID: result.lastInsertRowid,
            winner: winnerID === user1.userID ? sanitizedUser1Name : sanitizedUser2Name
        });

    } catch (error) {
        console.error("addMatch error details:", error);
        console.error("Error stack:", error.stack);
        request.log.error("addMatch error: ", error);
        return response.code(500).send({ message: "Internal server error", details: error.message });
    }
};

// Get user's match history
export const getUserMatches = async (request, response) => {
    try {
        const { name } = request.params;
        
        if (!name) {
            return response.code(400).send({ message: "Name parameter is required" });
        }

        const sanitizedName = sanitizeInput.sanitizeUsername(name);

        // Get user ID
        const user = db.prepare("SELECT userID FROM users WHERE name = ?").get(sanitizedName);
        if (!user) {
            return response.code(404).send({ message: "User not found" });
        }

        // Get matches where user participated
        const matches = db.prepare(`
            SELECT 
                m.matchID,
                m.matchType,
                m.matchMode,
                m.user1Score,
                m.user2Score,
                u1.name as user1Name,
                u2.name as user2Name,
                winner.name as winnerName,
                m.tournamentBracketID,
                m.tournamentMatchID
            FROM match m
            JOIN users u1 ON m.user1ID = u1.userID
            LEFT JOIN users u2 ON m.user2ID = u2.userID
            JOIN users winner ON m.winnerID = winner.userID
            WHERE m.user1ID = ? OR m.user2ID = ?
            ORDER BY m.matchID DESC
        `).all(user.userID, user.userID);

        const sanitizedMatches = matches.map(match => ({
            matchID: match.matchID,
            matchType: sanitizeInput.sanitizeUsername(match.matchType),
            matchMode: sanitizeInput.sanitizeUsername(match.matchMode),
            user1Name: sanitizeInput.sanitizeUsername(match.user1Name),
            user2Name: match.user2Name ? sanitizeInput.sanitizeUsername(match.user2Name) : 'Guest',
            user1Score: match.user1Score,
            user2Score: match.user2Score,
            winnerName: sanitizeInput.sanitizeUsername(match.winnerName),
            isWinner: match.winnerName === sanitizedName,
            tournamentBracketID: match.tournamentBracketID,
            tournamentMatchID: match.tournamentMatchID
        }));

        return response.code(200).send(sanitizedMatches);

    } catch (error) {
        request.log.error("getUserMatches error: ", error);
        return response.code(500).send({ message: "Internal server error" });
    }
};

// Get user statistics
export const getUserStats = async (request, response) => {
    try {
        const { name } = request.params;
        
        if (!name) {
            return response.code(400).send({ message: "Name parameter is required" });
        }

        const sanitizedName = sanitizeInput.sanitizeUsername(name);

        // Get user ID
        const user = db.prepare("SELECT userID FROM users WHERE name = ?").get(sanitizedName);
        if (!user) {
            return response.code(404).send({ message: "User not found" });
        }

        // Get win/loss statistics
        const stats = db.prepare(`
            SELECT 
                COUNT(*) as totalMatches,
                SUM(CASE WHEN winnerID = ? THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN winnerID != ? THEN 1 ELSE 0 END) as losses,
                matchType,
                matchMode
            FROM match 
            WHERE user1ID = ? OR user2ID = ?
            GROUP BY matchType, matchMode
        `).all(user.userID, user.userID, user.userID, user.userID);

        // Calculate overall stats
        const overallStats = db.prepare(`
            SELECT 
                COUNT(*) as totalMatches,
                SUM(CASE WHEN winnerID = ? THEN 1 ELSE 0 END) as totalWins,
                SUM(CASE WHEN winnerID != ? THEN 1 ELSE 0 END) as totalLosses
            FROM match 
            WHERE user1ID = ? OR user2ID = ?
        `).get(user.userID, user.userID, user.userID, user.userID);

        const winRate = overallStats.totalMatches > 0 
            ? (overallStats.totalWins / overallStats.totalMatches * 100).toFixed(1)
            : 0;

        return response.code(200).send({
            user: sanitizedName,
            overall: {
                totalMatches: overallStats.totalMatches,
                wins: overallStats.totalWins,
                losses: overallStats.totalLosses,
                winRate: `${winRate}%`
            },
            byGame: stats.map(stat => ({
                matchType: sanitizeInput.sanitizeUsername(stat.matchType),
                matchMode: sanitizeInput.sanitizeUsername(stat.matchMode),
                totalMatches: stat.totalMatches,
                wins: stat.wins,
                losses: stat.losses,
                winRate: `${(stat.wins / stat.totalMatches * 100).toFixed(1)}%`
            }))
        });

    } catch (error) {
        request.log.error("getUserStats error: ", error);
        return response.code(500).send({ message: "Internal server error" });
    }
};

////////////////////////////// CONTROLLER //////////////////////////////

const gameController = {
    addMatch,
    getUserMatches,
    getUserStats,
};

export default gameController;