import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // so you can access it from external IP if needed
    port: 3006, // 👈 your custom port
    allowedHosts: ['openbeat.ai', 'localhost','dev.openbeat.ai'],
    proxy: {
      '/api': {
        //target: 'http://localhost:5000', // backend server
        target: 'https://api.openbeat.ai',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})