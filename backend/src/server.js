///NEW
// import helmet from "@fastify/helmet";
import Fastify from "fastify";
import cors from '@fastify/cors';
import { initializeDatabase } from './database/initDatabase.js';

const PORT = Number(process.env.PORT || 8443);
export const db = initializeDatabase();


// Create Fastify instance
const app = Fastify({
  logger: true,
  // https: {
  //   key: fs.readFileSync(path.join('../https/key.pem')),
  //   cert: fs.readFileSync(path.join('../https/cert.pem'))
  // }
});

console.log("Fastify server is set...");

await app.register(cors, {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Allow cookies to be sent check to gosia
});

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