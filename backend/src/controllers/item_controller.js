import { v4 as uuidv4 } from 'uuid';
import { db } from '../server.js';

// const uuid = uuidv4();


// const fs = require('fs');
// const path = require('path');
// const Database = require('better-sqlite3');

// // Ensure the `data` folder exists
// const dataFolderPath = path.join(__dirname, '../data');
// if (!fs.existsSync(dataFolderPath)) {
//   fs.mkdirSync(dataFolderPath, { recursive: true });
//   console.log('Data folder created at:', dataFolderPath);
// }

// // The database will be saved here
// const db = new Database('database/db/transcendence.db');

// // Check if the `items` table exists
// const tableExists = db.prepare(`
//   SELECT name FROM sqlite_master WHERE type='table' AND name='items';
// `).get();

// if (!tableExists) {
//   // Create the `items` table if it doesn't exist
//   db.exec(`
//     CREATE TABLE items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       uuid TEXT UNIQUE NOT NULL,
//       name TEXT NOT NULL
//     );
//   `);

//   console.log('Table "items" created.');
// }

// Controller functions
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


const itemController = {
    getItems,
    getItem,
    addItem,
    deleteItem,
    updateItem,
};

export default itemController;
