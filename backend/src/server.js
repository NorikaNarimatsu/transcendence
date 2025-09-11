///NEW
// import helmet from "@fastify/helmet";


////////////////////////SETTING UP THE DATABASE//////////////////////////////

console.log("Setting up the database...");


import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the `database/db` folder exists
const databaseFolderPath = path.join(__dirname, "database/db");
if (!fs.existsSync(databaseFolderPath)) {
  fs.mkdirSync(databaseFolderPath, { recursive: true });
  console.log("Database folder created at:", databaseFolderPath);
}

console.log("Database path confirmed...");

// The database will be saved here
const db = new Database(path.join(databaseFolderPath, "transcendence.db"));

// Check if the `items` table exists
const tableExists = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' AND name='items';
`).get();

if (!tableExists) {
  db.exec(`
    CREATE TABLE items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL
    );
  `);
  console.log('Table "items" created.');
}

export default db; // to use this: import db from './path/to/this/file.js';

////////////////////////STARTING THE FASTIFY SERVER//////////////////////////////

const PORT = Number(process.env.PORT || 8443);


import Fastify from "fastify";
// Create Fastify instance
const app = Fastify({
  logger: true,
  // https: {
  //   key: fs.readFileSync(path.join('../https/key.pem')),
  //   cert: fs.readFileSync(path.join('../https/cert.pem'))
  // }
});

console.log("Fastify server is set...");

// // Register security headers
// await app.register(helmet, { contentSecurityPolicy: { useDefaults: true } });

// Health check endpoint
app.get("/health", async (request, reply) => {
  reply.send({ status: "ok" });
});

import paths from './routes/paths.js';

app.register(paths)

// Start the server
// try {
//   await app.listen({ port: PORT, host: "0.0.0.0" });
//   app.log.info(`HTTP backend listening on port ${PORT}`);
// } catch (err) {
//   app.log.error(err);
//   process.exit(1);
// }



const start = async () => {
  try {
      await app.listen({ port: PORT, host: "0.0.0.0" }); // Explicitly bind to 0.0.0.0
      console.log(`Server is running at http://localhost:${PORT}`); // Log server start
  } catch (error) {
      app.log.error(error);
      process.exit(1);
  }
};

start();