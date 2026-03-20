import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/retornocero/',
  server: {
    port: 8201,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://backend:8200',
        changeOrigin: true,
      }
    }
  },
  preview: {
    port: 8201,
    host: '0.0.0.0',
  }
})
