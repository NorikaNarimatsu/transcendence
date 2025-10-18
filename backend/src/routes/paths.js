import itemController from '../controllers/item_controller.js'
import userController from '../controllers/user_controller.js';
import gameController from '../controllers/game_controller.js';

export default async function itemRoutes(fastify, options) {
    // User validation
    fastify.post('/validateName', itemController.validateName);
    fastify.post('/validateEmail', itemController.validateEmail);
    fastify.post('/validatePasswordbyEmail', itemController.validatePasswordbyEmail);
    fastify.post('/validatePasswordbyUserID', itemController.validatePasswordByUserID);

    // User management
    fastify.post('/addNewUser', itemController.addNewUser);
    fastify.get('/getUserByEmail/:email', itemController.getUserByEmail);
    fastify.get('/getUserInfoByEmail/:email', itemController.getUserInfoByEmail);
    fastify.get('/getUserById/:userID', itemController.getUserById);
    fastify.get('/users/except/:userID', itemController.getUsersExceptUserID);
    fastify.put('/user/updateAvatar', itemController.updateAvatarUrl); // new avatar route

    // Friends management (using userID)
    fastify.post('/friends/add', itemController.addFriendByUserID);
    fastify.get('/friends/userID/:userID', itemController.getUserFriendsByUserID);
    
    // User profile
    fastify.get('/api/user/profile', userController.getProfile);
    fastify.post('/api/user/anonymize', userController.anonymizeUser);
	fastify.post('/api/user/export-data', userController.exportUserData);

    // Game management
    fastify.get('/user/:userID/matches', gameController.getUserMatches);      
    fastify.get('/user/:userID/stats', gameController.getUserStats);          
    fastify.post('/match', gameController.addMatch);
}