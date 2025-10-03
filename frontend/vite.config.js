import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: './',
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy all /logos/* requests to the backend
      '^/logos/.*': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        apiDocs: resolve(__dirname, 'api-docs.html'),
        logo: resolve(__dirname, 'logo.html')
      }
    }
  }
})
