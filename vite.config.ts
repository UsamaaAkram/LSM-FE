import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
   alias: {
     moment: 'moment/moment.js'
   },
 },
  build: {
    // NOTE: no custom manualChunks here. Manually splitting the React runtime
    // (react / react-dom / scheduler) across chunks causes out-of-order init
    // and the "Cannot set properties of undefined (setting 'Children')" crash.
    // Vite's default chunking is safe. Revisit perf via route-level lazy
    // loading (React.lazy + Suspense) instead of vendor splitting.
    chunkSizeWarningLimit: 1500,
  },
})
