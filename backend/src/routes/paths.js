import itemController from '../controllers/item_controller.js'
import userController from '../controllers/user_controller.js';
import gameController from '../controllers/game_controller.js';
import twoFactorController from '../controllers/2fa_controller.js';
import { authenticateToken } from '../utils/authForToken.js';

export default async function itemRoutes(fastify, options) {
    // User validation
    fastify.post('/validateName', itemController.validateName);
    fastify.post('/validateEmail', itemController.validateEmail);
    fastify.post('/validatePasswordbyEmail', {
		config: {
			rateLimit: {
				max: 15,
				timeWindow: '15 minutes'
			}
		}
	}, itemController.validatePasswordbyEmail);
    fastify.post('/validatePasswordbyUserID', itemController.validatePasswordByUserID);

    // User management
    fastify.post('/addNewUser', itemController.addNewUser);
    fastify.get('/getUserByEmail/:email', itemController.getUserByEmail);
    fastify.get('/getUserInfoByEmail/:email', itemController.getUserInfoByEmail);
    fastify.get('/getUserById/:userID', itemController.getUserById);
    fastify.get('/users/except/:userID', itemController.getUsersExceptUserID);
    fastify.get('/getUserEmailById/:userID', itemController.getUserEmailById);
    fastify.put('/user/updateAvatar', { preHandler: [authenticateToken] }, itemController.updateAvatarUrl); // new avatar route
	fastify.put('/user/uploadAvatar', { preHandler: [authenticateToken],
		config: {
			rateLimit: {
				max: 10,
				timeWindow: '1 hour'
			}
		}
	 }, itemController.uploadAvatar); //for the avatar upload
    fastify.put('/user/updateName', { preHandler: [authenticateToken] }, itemController.updateUserName);
    fastify.put('/user/updateEmail', { preHandler: [authenticateToken] }, itemController.updateUserEmail);

    // Friends management (using userID)
    fastify.post('/friends/add', { preHandler: [authenticateToken] }, itemController.addFriendByUserID);
    fastify.get('/friends/userID/:userID', { preHandler: [authenticateToken] }, itemController.getUserFriendsByUserID);

    // User profile
    fastify.get('/api/user/profile', { preHandler: [authenticateToken] }, userController.getProfile);
    fastify.post('/api/user/anonymize', { preHandler: [authenticateToken] }, userController.anonymizeUser);
	fastify.post('/api/user/export-data', { preHandler: [authenticateToken] }, userController.exportUserData);
    fastify.put('/api/user/language', { preHandler: [authenticateToken],}, userController.updateUserLanguage);
    fastify.get('/api/user/language', { preHandler: [authenticateToken] }, userController.getUserLanguage);

    // Game management
    fastify.get('/user/:userID/matches', { preHandler: [authenticateToken] }, gameController.getUserMatches);
    fastify.get('/user/:userID/stats', { preHandler: [authenticateToken] }, gameController.getUserStats);
    fastify.post('/match', { preHandler: [authenticateToken] }, gameController.addMatch);
    fastify.post('/tournament/bracket', { preHandler: [authenticateToken] }, gameController.createTournamentBracket);
    fastify.get('/tournament/:tournamentBracketID/matches', { preHandler: [authenticateToken] }, gameController.getTournamentMatches);

	// 2FA endpoints
	fastify.post('/2fa/enable', { preHandler: [authenticateToken] }, twoFactorController.enable2FA);
	fastify.post('/2fa/disable', { preHandler: [authenticateToken] }, twoFactorController.disable2FA);
	fastify.post('/2fa/send-code', {
		preHandler: [authenticateToken] ,
		config: {
			rateLimit: {
				max: 5,
				timeWindow: '10 minutes'
			}
		}
	}, twoFactorController.sendVerificationCode);
	fastify.post('/2fa/verify-code', { preHandler: [authenticateToken],
		config: {
			rateLimit: {
				max: 5,
				timeWindow: '15 minutes'
			}
		}
	 }, twoFactorController.verifyCode);
	fastify.get("/2fa/status", { preHandler: [authenticateToken] }, twoFactorController.get2FAstatus);
}