const { v4:uuidv4 } = require('uuid')

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Ensure the `data` folder exists
const dataFolderPath = path.join(__dirname, '../data');
if (!fs.existsSync(dataFolderPath)) {
  fs.mkdirSync(dataFolderPath, { recursive: true });
  console.log('Data folder created at:', dataFolderPath);
}

// The database will be saved here
const db = new Database('database/db/transcendence.db');

// Check if the `items` table exists
const tableExists = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' AND name='items';
`).get();

if (!tableExists) {
  // Create the `items` table if it doesn't exist
  db.exec(`
    CREATE TABLE items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL
    );
  `);

  console.log('Table "items" created.');
}

// let items = require('../item')

// // Seed data only if the table is empty
// const rowCount = db.prepare('SELECT COUNT(*) AS count FROM items').get().count;
// if (rowCount === 0) {
//   db.exec(`
//     INSERT INTO items (uuid, name) VALUES 
//       ('${uuidv4()}', 'Item 1'), 
//       ('${uuidv4()}', 'Item 2'), 
//       ('${uuidv4()}', 'Item 3');
//   `);
//   console.log('Seed data inserted into "items" table.');
// } else {
//   console.log(`Table "items" already contains ${rowCount} rows.`);
// }

// Controller functions
////////////////////////////// GET //////////////////////////////
const getItems = (req, res) => {
  const items = db.prepare('SELECT * FROM items').all();
  res.send(items);
};

// const getItems = (req,res) => {
//     res.send(items)
// }

const getItem = (req, res) => {
  const { id } = req.params;
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!item) {
    res.status(404).send({ error: 'Item not found' });
  } else {
    res.send(item);
  }
};

// const getItem = (req, res) => {
//     const { id } = req.params
//     const item = items.find((item) => item.id === id)
//     res.send(item)
// }

////////////////////////////// POST //////////////////////////////

const addItem = (req, res) => {
  const { name } = req.body;
  const uuid = uuidv4(); // Generate a unique UUID
  const result = db.prepare('INSERT INTO items (uuid, name) VALUES (?, ?)').run(uuid, name);
  res.status(201).send({ id: result.lastInsertRowid, name });
};

// const addItem = (req, res) => {
//     const { name } = req.body
//     const item = {
//         id: uuidv4(),
//         name,
//     }
//     items = [...items, item]
//     res.code(201).send(item)
// }

////////////////////////////// PUT //////////////////////////////

const updateItem = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const result = db.prepare('UPDATE items SET name = ? WHERE id = ?').run(name, id);
  if (result.changes === 0) {
    res.status(404).send({ error: 'Item not found' });
  } else {
    res.send({ id, name });
  }
};

// const updateItem = (req, res) => {
//     const {id} = req.params
//     const {name} = req.body
//     items = items.map(item => (item.id === id ? {id, name} : item))
//     item = items.find((item) => item.id === id)
//     res.send(item)
// }

////////////////////////////// DELETE //////////////////////////////

const deleteItem = (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  if (result.changes === 0) {
    res.status(404).send({ error: 'Item not found' });
  } else {
    res.status(204).send({message: `Item has been removed`});
  }
};

// const deleteItem = (req, res) => {
//     const {id} = req.params
//     items = items.filter(item => item.id !== id)
//     res.send({message: `Item ${id} has been removed`})
// }

module.exports = {
    getItems,
    getItem,
    addItem,
    deleteItem,
    updateItem,
}
