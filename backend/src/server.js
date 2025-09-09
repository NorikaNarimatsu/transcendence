import fs from "node:fs";
import Fastify from "fastify";
import helmet from "@fastify/helmet";

// Read cert/key made by entrypoint.sh
const PORT = Number(process.env.PORT || 8443);
const certPath = process.env.TLS_CERT_PATH;
const keyPath  = process.env.TLS_KEY_PATH;

if (!certPath || !keyPath) {
  console.error("TLS_CERT_PATH / TLS_KEY_PATH not set");
  process.exit(1);
}

const app = Fastify({
  logger: true,
  https: {
    cert: fs.readFileSync(certPath),
    key:  fs.readFileSync(keyPath)
  }
});

// Basic security headers (CSP defaults)
await app.register(helmet, { contentSecurityPolicy: { useDefaults: true } });

// Health check
app.get("/health", async () => ({ ok: true }));

// Start server
try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.log.info(`HTTPS backend listening on ${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}