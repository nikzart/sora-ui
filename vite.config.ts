import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import electron from 'vite-plugin-electron/simple'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        // Main process entry point
        entry: 'electron/main.ts',
      },
      preload: {
        // Preload script
        input: 'electron/preload.ts',
      },
      // Use Node.js API in the Renderer process
      renderer: process.env.NODE_ENV === 'test'
        ? undefined // Exclude in tests
        : {},
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Ensure base path is relative for Electron
  base: './',
  server: {
    port: 5173,
  },
})
