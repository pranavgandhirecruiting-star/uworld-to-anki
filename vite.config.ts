import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Output directly into the Anki add-on's web directory
    outDir: 'anki-addon/web',
    emptyOutDir: true,
  },
  server: {
    // During development, proxy API calls to the Anki add-on server
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:28735',
        changeOrigin: true,
      },
    },
  },
})
