// import helmet from "@fastify/helmet";
import Fastify from "fastify";
import cors from '@fastify/cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './database/initDatabase.js';


const PORT = Number(process.env.PORT || 8443);
export const db = initializeDatabase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug certificate paths
const certPath = path.join(__dirname, '../https/cert.pem');
const keyPath = path.join(__dirname, '../https/key.pem');
// // Log absolute paths for debugging
// console.log('Current directory:', __dirname);
// console.log('Certificate path:', path.resolve(certPath));
// console.log('Key path:', path.resolve(keyPath));

// Create Fastify instance
const app = Fastify({
  logger: true,
  https: {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  }
});

console.log("Fastify server is set...");

await app.register(cors, {
  origin: [
    'https://localhost:5173',  // Vite dev server
    'http://localhost:5173',   // HTTP fallback
    'http://localhost:3000',
    'https://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // allow cookies to be sent to gosia
});

// // Register security headers
// await app.register(helmet, { contentSecurityPolicy: { useDefaults: true } });

// Health check endpoint
app.get("/health", {
  logLevel: 'error',
  handler: async (request, reply) => {
    reply.send({ status: "ok" });
  }
});

import paths from './routes/paths.js';

app.register(paths)

const start = async () => {
  try {
      await app.listen({ port: PORT, host: "0.0.0.0" }); // Explicitly bind to 0.0.0.0
      console.log(`Server is running at https://localhost:${PORT}`); // Log server start
  } catch (error) {
      app.log.error(error);
      process.exit(1);
  }
};

start();