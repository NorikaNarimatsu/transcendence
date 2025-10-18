import { initializeDatabase } from "../database/initDatabase.js";
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
            tournamentBracketID,
            tournamentMatchID,
            user1ID,        // Player 1 ID (number)
            user2ID,        // Player 2 ID (number - 1=AI, 2=Guest, 3+=users)
            user1Score,     // Player 1 final score
            user2Score,     // Player 2 final score
            winnerID,       // the ID from the winner
            startedAt,      // Match start timestamp
            endedAt,        // Match end timestamp
        } = request.body;

        console.log("Extracted values:", { matchType, matchMode, user1ID, user2ID, user1Score, user2Score, startedAt, endedAt });

        // FIXED: Validate required fields
        if (!matchType || !matchMode || !user1ID || user2ID === undefined || user1Score === undefined || user2Score === undefined) {
            console.log("Validation failed - missing required fields");
            return response.code(400).send({ 
                message: "Missing required fields: matchType, matchMode, user1ID, user2ID, user1Score, user2Score" 
            });
        }

        console.log("Validation passed, validating inputs...");

        // FIXED: Validate specific values instead of using username sanitizer
        const validMatchTypes = ['pong', 'snake'];
        const validMatchModes = ['single', '2players', 'tournament'];

        if (!validMatchTypes.includes(matchType)) {
            console.log("Invalid matchType:", matchType);
            return response.code(400).send({ message: "Invalid matchType. Must be 'pong' or 'snake'" });
        }

        if (!validMatchModes.includes(matchMode)) {
            console.log("Invalid matchMode:", matchMode);
            return response.code(400).send({ message: "Invalid matchMode. Must be 'single', '2players', or 'tournament'" });
        }

        console.log("Input validation passed");

        if (user2ID === null && winnerID !== 0 && winnerID !== user1ID) {
            console.log("Invalid winnerID for single player game");
            return response.code(400).send({ message: "Winner must be user1 or 0 (tie/failure) in single player games" });
        }

        if (user2ID !== null && winnerID !== 0 && winnerID !== user1ID && winnerID !== user2ID) {
            console.log("Invalid winnerID for multiplayer game");
            return response.code(400).send({ message: "Winner must be either user1, user2, or 0 (tie) in multiplayer games" });
        }

        // SIMPLIFIED: Validate user IDs exist in database
        const user1 = db.prepare("SELECT userID, name FROM users WHERE userID = ?").get(user1ID);
        const user2 = user2ID !== null ? db.prepare("SELECT userID, name FROM users WHERE userID = ?").get(user2ID) : null;
        
        if (!user1) {
            console.log("User1 not found with ID:", user1ID);
            return response.code(404).send({ message: `User with ID ${user1ID} not found` });
        }
        

        if (user2ID !== null && !user2) {
            console.log("User2 not found with ID:", user2ID);
            return response.code(404).send({ message: `User with ID ${user2ID} not found` });
        }

        console.log("Users found:", { 
            user1: user1.name, 
            user2: user2 ? user2.name : 'None (Single Player)' 
        });

        console.log("Preparing to insert match...");
        const insertMatch = db.prepare(`
            INSERT INTO match (
                matchType, matchMode, tournamentBracketID, tournamentMatchID,
                user1ID, user2ID, user1Score, user2Score, winnerID, startedAt, endedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = insertMatch.run(
            matchType,
            matchMode,
            tournamentBracketID,
            tournamentMatchID,
            user1ID,
            user2ID,
            parseInt(user1Score),
            parseInt(user2Score),
            winnerID,
            startedAt || new Date().toISOString(), // Default to now if not provided
            endedAt || new Date().toISOString()     // Default to now if not provided
        );

        console.log("Insert successful:", result);

        const winnerName = winnerID === 0 
            ? 'Tie' 
            : (user2ID === null ? user1.name : (winnerID === user1ID ? user1.name : user2.name));

        return response.code(201).send({
            message: "Match saved successfully",
            matchID: result.lastInsertRowid,
            winner: winnerName,
            winnerID: winnerID,
            duration: startedAt && endedAt ? 
                Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000) : 
                null
        });

    } catch (error) {
        console.error("addMatch error details:", error);
        console.error("Error stack:", error.stack);
        request.log.error("addMatch error: ", error);
        return response.code(500).send({ message: "Internal server error", details: error.message });
    }
};

export const getUserMatches = async (request, response) => {
    try {
        const { userID } = request.params;
        
        if (!userID) {
            return response.code(400).send({ message: "UserID parameter is required" });
        }

        const sanitizedUserID = parseInt(userID);
        
        if (isNaN(sanitizedUserID)) {
            return response.code(400).send({ message: "Invalid userID" });
        }

        // Verify user exists
        const user = db.prepare("SELECT userID, name FROM users WHERE userID = ?").get(sanitizedUserID);
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
                u1.userID as user1ID,
                u1.name as user1Name,
                u2.userID as user2ID,
                u2.name as user2Name,
                winner.userID as winnerID,
                winner.name as winnerName,
                m.tournamentBracketID,
                m.tournamentMatchID
            FROM match m
            JOIN users u1 ON m.user1ID = u1.userID
            LEFT JOIN users u2 ON m.user2ID = u2.userID
            JOIN users winner ON m.winnerID = winner.userID
            WHERE m.user1ID = ? OR m.user2ID = ?
            ORDER BY m.matchID DESC
        `).all(sanitizedUserID, sanitizedUserID);

        const sanitizedMatches = matches.map(match => ({
            matchID: match.matchID,
            matchType: match.matchType,
            matchMode: match.matchMode,
            user1ID: match.user1ID,
            user1Name: sanitizeInput.sanitizeUsername(match.user1Name),
            user2ID: match.user2ID,
            user2Name: match.user2Name ? sanitizeInput.sanitizeUsername(match.user2Name) : 'Single Player',
            user1Score: match.user1Score,
            user2Score: match.user2Score,
            winnerID: match.winnerID,
            winnerName: sanitizeInput.sanitizeUsername(match.winnerName),
            isWinner: match.winnerID === sanitizedUserID,
            tournamentBracketID: match.tournamentBracketID,
            tournamentMatchID: match.tournamentMatchID
        }));

        return response.code(200).send(sanitizedMatches);

    } catch (error) {
        request.log.error("getUserMatches error: ", error);
        return response.code(500).send({ message: "Internal server error" });
    }
};

export const getUserStats = async (request, response) => {
    try {
        const { userID } = request.params;
        
        if (!userID) {
            return response.code(400).send({ message: "UserID parameter is required" });
        }

        const sanitizedUserID = parseInt(userID);
        
        if (isNaN(sanitizedUserID)) {
            return response.code(400).send({ message: "Invalid userID" });
        }

        // Verify user exists
        const user = db.prepare("SELECT userID, name FROM users WHERE userID = ?").get(sanitizedUserID);
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
        `).all(sanitizedUserID, sanitizedUserID, sanitizedUserID, sanitizedUserID);

        // Calculate overall stats
        const overallStats = db.prepare(`
            SELECT 
                COUNT(*) as totalMatches,
                SUM(CASE WHEN winnerID = ? THEN 1 ELSE 0 END) as totalWins,
                SUM(CASE WHEN winnerID != ? THEN 1 ELSE 0 END) as totalLosses
            FROM match 
            WHERE user1ID = ? OR user2ID = ?
        `).get(sanitizedUserID, sanitizedUserID, sanitizedUserID, sanitizedUserID);

        const winRate = overallStats.totalMatches > 0 
            ? (overallStats.totalWins / overallStats.totalMatches * 100).toFixed(1)
            : 0;

        return response.code(200).send({
            userID: sanitizedUserID,
            userName: user.name,
            overall: {
                totalMatches: overallStats.totalMatches,
                wins: overallStats.totalWins,
                losses: overallStats.totalLosses,
                winRate: `${winRate}%`
            },
            byGame: stats.map(stat => ({
                matchType: stat.matchType,
                matchMode: stat.matchMode,
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

const gameController = {
    addMatch,
    getUserMatches,
    getUserStats,
};

export default gameController;