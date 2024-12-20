import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: './public',
  server: {
    port: 8000,
    open: '/',
  },
  build: { outDir: '../' },
  plugins: [react()],
})
