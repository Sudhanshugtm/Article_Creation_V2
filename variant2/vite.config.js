import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // Use relative paths so the build works on GitHub Pages (project pages) without
  // hardcoding the repository name.
  base: './',
  plugins: [vue()],
  server: {
    host: true,
    port: 5178,
    strictPort: true
  },
  preview: {
    host: true,
    port: 5178,
    strictPort: true
  }
})
