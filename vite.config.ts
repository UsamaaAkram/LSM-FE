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
    // Split heavy vendor libs into their own cached chunks so the initial
    // JS payload is smaller and long-term caching works better.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router') || id.includes('react-dom') || /[\\/]react[\\/]/.test(id)) {
              return 'react-vendor';
            }
            if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('redux')) {
              return 'redux-vendor';
            }
            if (id.includes('antd') || id.includes('rc-') || id.includes('@ant-design')) {
              return 'antd-vendor';
            }
            if (id.includes('moment') || id.includes('dayjs')) {
              return 'date-vendor';
            }
            if (id.includes('apexcharts') || id.includes('chart') || id.includes('fullcalendar')) {
              return 'charts-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})
