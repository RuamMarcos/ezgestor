import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // For builds, emit assets under /static/ so Django can serve them
  // For dev server, use '/'
  base: command === 'build' ? '/static/' : '/',
}))
