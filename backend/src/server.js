import Fastify from "fastify";
import helmet from "@fastify/helmet";

// Read the port from environment variables or use the default
const PORT = Number(process.env.PORT || 8443);

// Create Fastify instance
const app = Fastify({
  logger: true,
});

// Register security headers
await app.register(helmet, { contentSecurityPolicy: { useDefaults: true } });

// Health check endpoint
app.get("/health", async (request, reply) => {
  reply.send({ status: "ok" });
});

// Start the server
try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.log.info(`HTTP backend listening on port ${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}