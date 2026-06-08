import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite Production Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Optimized build settings for production deployment.
 * Enables minification, code splitting, and performance monitoring.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default defineConfig({
  plugins: [react()],
  base: './',
  mode: 'production',
  
  define: {
    'process.env': {},
    global: 'globalThis',
  },

  build: {
    // ─── OUTPUT CONFIGURATION ─────────────────────────────────────────────
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,  // Disable source maps in production (security + size)
    
    // ─── MINIFICATION & OPTIMIZATION ──────────────────────────────────────
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.log, .warn, .error in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      format: {
        comments: false,  // Strip all comments
      },
    },

    // ─── CODE SPLITTING ──────────────────────────────────────────────────
    rollupOptions: {
      output: {
        // Optimize chunk naming for caching
        entryFileNames: 'assets/js/[name].[hash].js',
        chunkFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: 'assets/[ext]/[name].[hash][extname]',

        // Manual chunks for better caching and parallel loading
        manualChunks: {
          // Vendor dependencies (rarely change)
          'vendor-firebase': ['firebase', '@capacitor-firebase/authentication'],
          'vendor-ui': ['framer-motion'],
          'vendor-ai': ['@google/generative-ai'],
          
          // 3D effects (lazy-loaded, heavy)
          '3d-effects': ['three', 'ogl', 'postprocessing'],
          
          // Utilities (frequently used)
          'utils-export': ['jspdf', 'jspdf-autotable', 'html-to-image'],
          
          // React & routing (core)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // Capacitor (native APIs)
          'capacitor': [
            '@capacitor/core',
            '@capacitor/android',
            '@capacitor/filesystem',
            '@capacitor/share',
          ],
        },
      },
    },

    // ─── PERFORMANCE THRESHOLDS ──────────────────────────────────────────
    target: 'esnext',  // Modern browsers only (smaller output)
    modulePreload: { polyfill: false },  // Don't polyfill, save bytes

    // ─── CHUNK SIZE WARNINGS ─────────────────────────────────────────────
    chunkSizeWarningLimit: 500,  // Warn if chunks exceed 500KB
    cssCodeSplit: true,  // Split CSS per component (better caching)
  },

  // ─── PERFORMANCE HINTS ────────────────────────────────────────────────
  server: {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  },

  // ─── OPTIMIZATION ─────────────────────────────────────────────────────
  ssr: false,  // Client-side only (no server-side rendering)
  
  esbuild: {
    drop: ['console', 'debugger'],  // Remove console statements
    legalComments: 'none',  // Strip license comments
  },
});
