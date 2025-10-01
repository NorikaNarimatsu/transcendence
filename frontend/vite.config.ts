import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
	https: {
		key: readFileSync(resolve(__dirname, 'https/key.pem')),
		cert: readFileSync(resolve(__dirname, 'https/cert.pem'))
	},
    host: '0.0.0.0',  // Bind to all network interfaces
    port: 3000,       // Use port 3000 for consistency 
  },
})
