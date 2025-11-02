import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// import { resolve } from 'path'
// import { readFileSync, existsSync } from 'fs'


// const certPath = resolve(__dirname, 'https/cert.pem')
// const keyPath = resolve(__dirname, 'https/key.pem')


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
	// https: {
	// 	key: readFileSync(keyPath),
	// 	cert: readFileSync(certPath)
	// },
    host: '0.0.0.0',  // Bind to all network interfaces
    port: 3000,       // Use port 3000 for consistency 
  },
})
