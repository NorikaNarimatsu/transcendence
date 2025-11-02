import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const httpsDir = resolve(__dirname, '../https');
const certPath = resolve(httpsDir, 'cert.pem');
const keyPath = resolve(httpsDir, 'key.pem');

if (existsSync(certPath) && existsSync(keyPath)) {
	console.log('Certificates already exist');
	process.exit(0);
}

if (!existsSync(httpsDir)) {
	mkdirSync(httpsDir, { recursive: true });
	console.log('Created https directory');
}

try {
	console.log('Generating self-signed certificates for the frontend');
	execSync(
		`openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1,IP:::1"`,
		{ stdio: 'inherit' }
	);
	execSync(`chmod 600 ${keyPath}`, { stdio: 'inherit' });
	console.log('Certificates for the frontend generated successfully');
} catch (error) {
	console.error('Error generating certificates for the frontend:', error.message);
	process.exit(1);
}