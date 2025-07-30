import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    process: 'process',
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      buffer: 'buffer',
      stream: 'stream-browserify',
      process: 'process/browser',
    }
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'stream-browserify']
  }
})