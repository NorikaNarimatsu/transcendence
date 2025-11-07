import helmet from "@fastify/helmet";
import Fastify from "fastify";
import FastifyJWT from "@fastify/jwt";
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/initDatabase.js';
import rateLimit from '@fastify/rate-limit';

dotenv.config();

const PORT = Number(process.env.PORT || 8080);
export const db = await initializeDatabase();

// Create Fastify instance
const app = Fastify({
  logger: true,
  bodyLimit: 2 * 1024 * 1024, // limit for upload size (2MB)
});

console.log("Fastify server is set...");

await app.register(cors, {
  origin: [
	'https://localhost:8443',
	'https://localhost'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  exposedHeaders: ['Renewed-Token']
});

await app.register(FastifyJWT, {
  secret: process.env.JWT_SECRET
});

await app.register(rateLimit, {
	global: true,
	max: 100,
	timeWindow: '1 minute'
});


// // Register security headers
await app.register(helmet, {
	frameguard: { action: 'deny' },
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
			scriptSrc: ["'self'"],
			imgSrc: ["'self'", "data:", "https://localhost:8443/uploadAvatars"], //may need to be changed for uploaded images
			connectSrc: ["'self'", "https://localhost"],
			fontSrc: ["https://fonts.gstatic.com"],
			objectSrc: ["'none'"],
			mediaSrc: ["'none'"],
			frameSrc: ["'none'"],
		},
	},
crossOriginEmbedderPolicy: false,
});

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
      console.log(`Server is running at http://localhost:${PORT}`); // Log server start
  } catch (error) {
      app.log.error(error);
      process.exit(1);
  }
};

start();