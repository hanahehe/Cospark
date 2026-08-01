import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // sockjs-client reaches for the Node `global`, which doesn't exist in the browser.
  define: {
    global: 'globalThis',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // http:// (not ws://) because SockJS opens with an HTTP call to /ws/info and only
      // then upgrades; ws:true still handles the upgrade.
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
