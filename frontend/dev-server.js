// frontend/dev-server.js (ESM)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PORT   = Number(process.env.PORT || 3000);
const HOST   = process.env.HOST || '0.0.0.0';
const PUBLIC = path.join(__dirname, 'public');

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.map':  'application/json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let filePath = path.join(PUBLIC, urlPath === '/' ? '/index.html' : urlPath);

  // SPA fallback to index.html if file doesn't exist
  if (!fs.existsSync(filePath)) {
    filePath = path.join(PUBLIC, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = types[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Server error');
      return;
    }
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Frontend dev server at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
});
