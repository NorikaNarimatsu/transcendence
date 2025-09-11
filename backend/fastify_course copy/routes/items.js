// const items = require('../item');
const { getItem, getItems, addItem, deleteItem, updateItem } = require('../controllers/item_controller')

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


// function itemRoutes(fastify, options, done) {

//     // Get all items
//     fastify.get('/items', itemController.getAllItems)

//     // Get single item
//     fastify.get('/items/:id', itemController.getItemById)

//     // Add item
//     fastify.post('/items', itemController.postItem)

//     // Delete item
//     fastify.delete('/items/:id', deleteItemOpts)

//     // Update item
//     fastify.put('/items/:id', updateItemOpts)


//     done()
// }

const itemController = require('../controllers/item_controller');

async function itemRoutes(fastify, options) {
    fastify.get('/items', itemController.getItems);
    fastify.get('/items/:id', itemController.getItem);
    fastify.post('/items', itemController.addItem);
    fastify.put('/items/:id', itemController.updateItem);
    fastify.delete('/items/:id', itemController.deleteItem);
  }

module.exports = itemRoutes