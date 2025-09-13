import { v4 as uuidv4 } from 'uuid';
import { db } from '../server.js';

////////////////////////////// GET //////////////////////////////
export function getItems(req, res) {
  const items = db.prepare('SELECT * FROM items').all();
  res.send(items);
};

export function getItem(req, res) {
  const { id } = req.params;
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!item) {
    res.status(404).send({ error: 'Item not found' });
  } else {
    res.send(item);
  }
};

////////////////////////////// POST //////////////////////////////

export function addItem(req, res) {
  const { name } = req.body;
  const uuid = uuidv4(); // Generate a unique UUID
  const result = db.prepare('INSERT INTO items (uuid, name) VALUES (?, ?)').run(uuid, name);
  res.status(201).send({ id: result.lastInsertRowid, name });
};

////////////////////////////// PUT //////////////////////////////

export function updateItem(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  const result = db.prepare('UPDATE items SET name = ? WHERE id = ?').run(name, id);
  if (result.changes === 0) {
    res.status(404).send({ error: 'Item not found' });
  } else {
    res.send({ id, name });
  }
};

////////////////////////////// DELETE //////////////////////////////

export function deleteItem(req, res) {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  if (result.changes === 0) {
    res.status(404).send({ error: 'Item not found' });
  } else {
    res.status(204).send({message: `Item has been removed`});
  }
};

////////////////////////////// NEW VALIDATION //////////////////////////////

export const validateItem = (name) => {
  if (!name.match(/^[A-Za-z]+$/))
    throw new Error('Name must contain only letters');
  if (name.length < 2 || name.length > 20)
    throw new Error('Name must be between 2 and 20 characters');
  return true;
};

// Combined function using existing addItem
export const validateAndAddItem = async (request, reply) => {
  const { name } = request.body; // request.body now contains: { name: "whatever user typed" }
  try {
    validateItem(name);    
    return addItem(request, reply);
  } catch (error) {
    request.log.error(error);
    return reply.code(400).send({
      message: error.message || 'Validation failed'
    });
  }
};

// Frontend                        Backend
//    |                               |
//    |-- POST /validate-name ------->|
//    |   { "name": "Norika" }        |
//    |                               |
//    |                         Validates name
//    |                         Stores in DB
//    |                               |
//    |<- Response 200 ---------------|
//    |   { "message": "success" }    |

////////////////////////////// CONTROLLER //////////////////////////////

const itemController = {
    getItems,
    getItem,
    addItem,
    deleteItem,
    updateItem,
    validateAndAddItem //new
};

export default itemController;


