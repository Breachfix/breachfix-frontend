import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:7001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    // Define environment variables that can be used in the app
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  envPrefix: 'VITE_', // Only expose environment variables that start with VITE_
})
