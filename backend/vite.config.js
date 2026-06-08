import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/bundle-analysis.html',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Job Genie',
        short_name: 'Genie',
        description: 'THE FUTURE OF WORK — Connecting Talent with Opportunity',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        icons: [
          { src: 'favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'favicon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[a-z]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'leaflet-map-tiles',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    }),
  ],
  base: './',
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Firebase SDK — large, changes rarely, great for caching
          if (id.includes('node_modules/firebase')) return 'firebase-core';
          
          // Framer-motion — isolate animation library from main bundle
          if (id.includes('node_modules/framer-motion')) return 'framer-motion';
          
          // 3D libraries (three.js, ogl, postprocessing) — large but rarely used
          if (id.includes('node_modules/three') || id.includes('node_modules/ogl') || id.includes('node_modules/postprocessing')) {
            return 'vendor-3d';
          }
          
          // Google Generative AI (Gemini) — large SDK, lazy-loaded when needed
          if (id.includes('node_modules/@google/generative-ai')) {
            return 'vendor-ai';
          }
          
          // Per-screen code splitting for faster first paint
          if (id.includes('/screens/HomeScreen')) return 'screen-home';
          if (id.includes('/screens/FindGigScreen')) return 'screen-findgig';
          if (id.includes('/screens/AdminDashboard')) return 'screen-admin';
          if (id.includes('/screens/AttendanceScreen')) return 'screen-attendance';
          if (id.includes('/screens/JobDetailsScreen')) return 'screen-jobdetails';
          if (id.includes('/screens/EarningsScreen')) return 'screen-earnings';
          if (id.includes('/screens/MyJobsScreen')) return 'screen-myjobs';
          if (id.includes('/screens/CreateJobScreen')) return 'screen-create';
          if (id.includes('/screens/WorkerApplicationsScreen')) return 'screen-applications';
          if (id.includes('/screens/AdminJobsScreen')) return 'screen-adminjobs';
          if (id.includes('/screens/SuperAdminDashboard')) return 'screen-superadmin';
          if (id.includes('/screens/ProfileScreen')) return 'screen-profile';
          
          // Services — shared utilities
          if (id.includes('/services/')) return 'services';
          
          // Components
          if (id.includes('/components/')) return 'components';
          
          // Constants
          if (id.includes('/constants/')) return 'constants';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
