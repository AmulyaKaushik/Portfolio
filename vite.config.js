import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to the backend in server/ during development
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
