const items = require('../item');

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
                items: Item
            }
        }
    }
}

// Options for get single items
const getItemOpts = {
    schema: {
        response: {
            200: Item,
        }
    }
}

function itemRoutes(fastify, options, done) {

    // Get all items
    fastify.get('/items', getItemsOpts, (req, res) => {
        res.send(items);
    });

    // Get single item
    fastify.get('/items/:id', getItemOpts, (req, res) => {
        const {id} = req.params;

        const item = items.find(item => item.id === id);

        res.send(item);
    });

    
    done()
}

module.exports = itemRoutes