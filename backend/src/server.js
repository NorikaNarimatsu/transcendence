import helmet from "@fastify/helmet";
import Fastify from "fastify";
import FastifyJWT from "@fastify/jwt";
import cors from '@fastify/cors';
import fs from 'fs';
import path from 'path';
// import { fileURLToPath } from 'url'; ->TODO delete the comments if nginx works
// import { execSync } from 'child_process';
import dotenv from 'dotenv'; // NORIKA ADDED GOSIA
import { initializeDatabase } from './database/initDatabase.js';

// Load environment variables // NORIKA ADDED GOSIA
dotenv.config();              // NORIKA ADDED GOSIA


const PORT = Number(process.env.PORT || 8080);
export const db = await initializeDatabase();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const httpsDir = path.join(__dirname, '../https');
// const certPath = path.join(httpsDir, 'cert.pem');
// const keyPath = path.join(httpsDir, 'key.pem');

// if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
// 	console.log('Backend self-signed certificates not found, generating them');

// 	if (!fs.existsSync(httpsDir)) {
// 		fs.mkdirSync(httpsDir, { recursive: true });
// 		console.log('Created https directory for the backend');
// 	}

// 	try {
// 		execSync(
// 			`openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/CN=localhost"`,
// 			{ stdio: 'inherit' }
// 		);
// 		console.log('Backend certificates generated successfully');
// 	} catch (error) {
// 		console.error('Error generating self-signed certificates fot the backend: ', error.message);
// 		process.exit(1);
// 	}
// } else {
// 	console.log ('Backend self-signed certificates already exist');
// }


// Create Fastify instance
const app = Fastify({
  logger: true,
//   https: {
//     key: fs.readFileSync(keyPath),
//     cert: fs.readFileSync(certPath)
//   }
});

console.log("Fastify server is set...");

await app.register(cors, {
  origin: [
    // 'https://localhost:5173',  // Vite dev server
    // 'http://localhost:5173',   // HTTP fallback
    // 'http://localhost:3000',
    // 'https://localhost:3000'
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

// // Register security headers
await app.register(helmet, { contentSecurityPolicy: {
	directives: {
		defaultSrc: ["'self'"],
		styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
		scriptSrc: ["'self'"],
		imgSrc: ["'self'", "data:"], //may need to be changed for uploaded images
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