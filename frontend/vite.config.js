import { defineConfig } from 'vite'

// Dev server proxy: forward /api requests to backend dev server on :4000
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
