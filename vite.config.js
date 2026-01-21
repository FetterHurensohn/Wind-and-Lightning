import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Relative paths for Electron
  server: {
    port: 3000,
    strictPort: false,
    host: '0.0.0.0',
    allowedHosts: ['localhost', '.preview.emergentagent.com'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Force React into a single vendor chunk
          'vendor-react': ['react', 'react-dom', 'scheduler']
        }
      }
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'scheduler']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'scheduler']
  }
})
