import { v4 as uuidv4 } from 'uuid';
import { db } from '../server.js';

////////////////////////////// GET //////////////////////////////
export function getItems(request, response) {
  const items = db.prepare('SELECT * FROM items').all();
  response.send(items);
};

export function getItem(request, response) {
  const { id } = request.params;
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!item) {
    response.status(404).send({ error: 'Item not found' });
  } else {
    response.send(item);
  }
};

////////////////////////////// POST //////////////////////////////

export function addItem(request, response) {
  const { name, email, password } = request.body;
  const uuid = uuidv4(); // Generate a unique UUID
  const responseult = db.prepare('INSERT INTO items (uuid, name, email, password) VALUES (?, ?, ?, ?)').run(uuid, name, email, password);
  response.status(201).send({ id: responseult.lastInsertRowid, name , email, created_at: new Date().toISOString()});
};

////////////////////////////// PUT //////////////////////////////

export function updateItem(request, response) {
  const { id } = request.params;
  const { name } = request.body;
  const { email } = request.body;
  const { password } = request.body;
  const responseult = db.prepare('UPDATE items SET name = ? WHERE id = ?').run(name, id);
  if (responseult.changes === 0) {
    response.status(404).send({ error: 'Item not found' });
  } else {
    response.send({ id, name, email, password });
  }
};

////////////////////////////// DELETE //////////////////////////////

export function deleteItem(request, response) {
  const { id } = request.params;
  const responseult = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  if (responseult.changes === 0) {
    response.status(404).send({ error: 'Item not found' });
  } else {
    response.status(204).send({message: `Item has been removed`});
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
export const validateAndAddItem = async (request, response) => {
  const { name } = request.body; // request.body now contains: { name: "whatever user typed" }
  try {
    validateItem(name);    
    return addItem(request, response);
  } catch (error) {
    request.log.error(error);
    return response.code(400).send({
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
//    |                         Storesponse in DB
//    |                               |
//    |<- responseponse 200 ---------------|
//    |   { "message": "success" }    |


////////////////////////////// NEW VALIDATION //////////////////////////////
export const validateAndAddEmail = async (request, response) => {
  const { email } = request.body;
  try {
    const isExisting = db.prepare('SELECT * FROM items WHERE email = ?').get(email)
    if (isExisting)
      return response.code(200).send();
    else
      return response.code(404).send();
  } catch (error) {
    // request.log.error(error);
    return response.code(500).send();
  }
}

////////////////////////////// CONTROLLER //////////////////////////////

const itemController = {
    getItems,
    getItem,
    addItem,
    deleteItem,
    updateItem,
    validateAndAddItem, //new
    validateAndAddEmail
};

export default itemController;


