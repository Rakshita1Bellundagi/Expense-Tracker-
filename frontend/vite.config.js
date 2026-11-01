import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dedicated port 5180 to avoid collision with any other project (e.g. Student Project Showcase on 5173)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
  },
})
