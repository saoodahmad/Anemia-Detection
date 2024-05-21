import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  preview: {
    port: 5173
  },
  dev: {
    port: 5173
  },
  plugins: [react()],
})
