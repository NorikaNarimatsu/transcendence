import { start } from 'repl';
import { db } from '../server.js';
import gameController from './game_controller.js';

const userAnon = {
    anonymizeUserData: (userId) => {
        const anonymizedName = `anon${userId}`;
        const anonymizedEmail = `deleted_${userId}@anonymized.com`;
        const anonymizedPassword = 'ANONYMIZED';
        const defaultAvatarUrl = '/avatars/Avatar_1.png';

        return {
            name: anonymizedName,
            email: anonymizedEmail,
            password: anonymizedPassword,
            avatarUrl: defaultAvatarUrl
        };
    },

    performAnonymization: async (userID) => {
        // Check if user exists
        const user = db.prepare('SELECT userID FROM users WHERE userID = ?').get(userID);
        if (!user) {
            throw new Error('User not found');
        }

        // Generate anonymous data
        const anonymizedData = userAnon.anonymizeUserData(userID);

        // Update user with anonymized data
        const updateResult = db.prepare(`
            UPDATE users 
            SET name = ?, email = ?, password = ?, avatarUrl = ? 
            WHERE userID = ?
        `).run(anonymizedData.name, anonymizedData.email, anonymizedData.password, anonymizedData.avatarUrl, userID);

        if (updateResult.changes === 0) {
            throw new Error('Failed to anonymize user data');
        }

        return {
            message: 'User data anonymized successfully',
            anonymizedName: anonymizedData.name
        };
    }
};

const userController = {
    getProfile: async (request, reply) => {
        try {
            const email = request.query.email;
            if (!email) {
                reply.status(400).send({ error: 'Email is required' });
                return;
            }
            const row = db.prepare('SELECT name, avatarUrl FROM users WHERE email = ?').get(email);
            if (!row) {
                reply.status(404).send({ error: 'User not found' });
            } else {
                reply.send({
                    name: row.name,
                    avatarUrl: row.avatarUrl,
                });
            }
        } catch (err) {
            reply.status(500).send({ error: 'Database error', details: err.message });
        }
    },

    anonymizeUser: async (request, reply) => {
        try {
            const { userID } = request.body; 
            
            if (!userID) {
                reply.status(400).send({ error: 'UserID is required' });
                return;
            }

            // const sanitizedUserID = parseInt(userID);
            // if (isNaN(sanitizedUserID)) {
            //     reply.status(400).send({ error: 'Invalid userID format' });
            //     return;
            // }

            const result = await userAnon.performAnonymization(userID);
            reply.send(result);

        } catch (err) {
            if (err.message === 'User not found') {
                reply.status(404).send({ error: err.message });
            } else {
                reply.status(500).send({ error: 'Database error', details: err.message });
            }
        }
    },

	exportUserData: async (request, reply) => {

		try {
			const { userID } = request.body;

			if (!userID) {
				reply.status(400).send({ error: 'userID is required' });
				return;
			}
			
			// getting user's basic info
			const user = db.prepare(`
				SELECT userID, name, email, createdAt, lastLoginAt, lang
				FROM users
				WHERE userID = ?
			`).get(userID);

			if (!user) {
				reply.status(404).send({ error: 'User not found' });
				return;
			}

			// getting user's match history
			const matches = db.prepare(`
				SELECT
					m.matchID,
					m.matchType,
					m.matchMode,
					m.user1Score,
					m.user2Score,
					m.winnerID,
					m.startedAt,
					m.endedAt,
					u1.name as user1Name,
					u2.name as user2Name
				FROM match m
				LEFT JOIN users u1 ON m.user1ID = u1.userID
				LEFT JOIN users u2 ON m.user2ID = u2.userID
				WHERE m.user1ID =? OR m.user2ID = ?
				ORDER BY m.startedAt DESC
			`).all(user.userID, user.userID);


			const overallStats = db.prepare(`
				SELECT
					COUNT(*) as totalMatches,
					SUM(CASE WHEN winnerID = ? THEN 1 ELSE 0 END) as totalWins,
					SUM(CASE WHEN winnerID != ? THEN 1 ELSE 0 END) as totalLosses
				FROM match
				WHERE user1ID = ? OR user2ID = ?
			`).get(userID, userID, userID, userID);

			const winRate = overallStats.totalMatches > 0 
				? (overallStats.totalWins / overallStats.totalMatches * 100).toFixed(1) 
				: 0;
			
			// getting friends list
			const friends = db.prepare(`
				SELECT
					f.registeredAt,
					CASE
						WHEN f.user1ID = ? THEN u2.name
						ELSE u1.name
					END as friendName,
					CASE
						WHEN f.user1ID = ? THEN u2.email
						ELSE u1.email
					END as friendEmail
				FROM friends f
				LEFT JOIN users u1 ON f.user1ID = u1.userID
				LEFT JOIN users u2 ON f.user2ID = u2.userID
				WHERE f.user1ID = ? OR f.user2ID = ?
				ORDER BY f.registeredAt DESC
			`).all(userID, userID, userID, userID);
			
			const exportData = {
				exportDate: new Date().toISOString(),
				userData: {
					userID: user.userID,
					nickname: user.name,
					email: user.email,
					accountCreated: user.createdAt,
					lastLogin: user.lastLoginAt,
					languagePreference: user.lang,
				},
				gameStatistics: {
					totalMatches: overallStats.totalMatches || 0,
					wins: overallStats.totalWins || 0,
					losses: overallStats.totalLosses || 0,
					winRate: `${winRate}%`
				},
				matchHistory: matches.map(match => ({
					matchType: match.matchType,
					matchMode: match.matchMode,
					user1Name: match.user1Name,
					user1Score: match.user1Score,
					user2Name: match.user2Name,
					user2Score: match.user2Score,
					startedAt: match.startedAt,
					endedAt: match.endedAt,
				})),
				friendsList: friends.map(friend => ({
					friendsName: friend.friendName,
				}))
			};

			reply.header('Content-Type', 'application/json');
			reply.header('Content-Disposition', `attachment; filename="user_data_${user.name}_${new Date().toISOString().split('T')[0]}.json"`);

			reply.send(exportData);
		} catch (err) {
			console.error('Export error:', err);
			reply.status(500).send({ error: 'Failed to export user data', details: err.message });
		}
	},
};

export default userController;