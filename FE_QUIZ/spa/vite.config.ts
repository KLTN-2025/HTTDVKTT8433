import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: true,
    proxy: {
      '/api/v1/identity': {
        target: 'http://api.duongtech.me',
        changeOrigin: true,
        secure: false
      },
      '/api/v1/admin': {
        target: 'http://api.duongtech.me',
        changeOrigin: true,
        secure: false
      },
      '/api/v1/quiz': {
        target: 'http://api.duongtech.me',
        changeOrigin: true,
        secure: false
      },
      '/api/v1/Ai': {
        target: 'http://api.duongtech.me',
        changeOrigin: true,
        secure: false
      },
      '/api/v1/profile': {
        target: 'http://api.duongtech.me',
        changeOrigin: true,
        secure: false
      },
      '/api/v1/notification': {
        target: 'http://api.duongtech.me',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

