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
    // fastify.get('/listUsers', itemController.getAllUsers);
    fastify.get('/users/except/:userID', itemController.getUsersExceptUserID);

    // Friends management (using userID)
    fastify.post('/friends/add', itemController.addFriendByUserID);
    fastify.get('/friends/userID/:userID', itemController.getUserFriendsByUserID);
    
    // User profile
    fastify.get('/api/user/profile', userController.getProfile);
    fastify.post('/api/user/anonymize', userController.anonymizeUser);

    // Game management
    fastify.post('/matches/add', gameController.addMatch);
    fastify.get('/matches/user/:name', gameController.getUserMatches);
    fastify.get('/stats/user/:name', gameController.getUserStats);
}