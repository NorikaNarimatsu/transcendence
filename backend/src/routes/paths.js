import { getItem, getItems, addItem, deleteItem, updateItem } from '../controllers/item_controller.js'
import itemController from '../controllers/item_controller.js'
import userController from '../controllers/user_controller.js';


// Item schema
const Item = {
    type: 'object',
    properties: {
        id: {type: 'string'},
        name: {type: 'string'}
    }
}

// Options for get all items
const getItemsOpts = {
    schema: {
        response: {
            200: {
                type: 'array',
                items: Item,
            },
        },
    },
    handler: getItems,
}

// Options for get single items
const getItemOpts = {
    schema: {
        response: {
            200: Item,
        },
    },
    handler: getItem,
}

const postItemOpts = {
    schema: {
        body: {
            type: 'object',
            required: ['name'],
            properties: {
                name: { type: 'string' },
            }
        },
        response: {
            201: Item,
        },
    },
    handler: addItem,
}


const deleteItemOpts = {
    schema: {
        response: {
            200: {
                type: 'object',
                properties: {
                    message: {type: 'string'},
                }
            },
        },
    },
    handler: deleteItem,
}

const updateItemOpts = {
    schema: {
        response: {
            200: Item,
        },
    },
    handler: updateItem,
}


export default async function itemRoutes(fastify, options) {
    fastify.get('/items', itemController.getItems);
    fastify.get('/items/:id', itemController.getItem);
    fastify.post('/items', itemController.addItem);
    fastify.put('/items/:id', itemController.updateItem);
    fastify.delete('/items/:id', itemController.deleteItem);


    fastify.post('/validate-name', itemController.validateAndAddItem);
    fastify.post('/validateEmail', itemController.validateEmail);
    fastify.post('/validatePasswordbyEmail', itemController.validatePasswordbyEmail);
    fastify.post('/validatePasswordbyName', itemController.validatePasswordbyName);
    fastify.post('/addNewUser', itemController.addNewUser);
    fastify.get('/getUserByEmail/:email', itemController.getUserByEmail);
    fastify.get('/getUserInfoByEmail/:email', itemController.getUserInfoByEmail);
    fastify.get('/api/user/profile', userController.getProfile);
    fastify.get('/listUsers', itemController.getAllUsers);
    fastify.get('/users/except/:email', itemController.getAllUsersExceptCurrent);

}
