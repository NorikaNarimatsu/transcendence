import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Bind to all network interfaces
    port: 3000,       // Use port 3000 for consistency 
    proxy: {
      '/api': {
        target: 'https://backend:8443',
        changeOrigin: true,
        secure: false, // allow self-signed certs
      },
    },
  },
})
