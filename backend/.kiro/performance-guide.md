# Performance Optimization Guide

## 📊 Current Metrics

- **Bundle Size**: ~500KB gzipped (target: <500KB)
- **Initial Load**: 1–2 seconds (dev server with HMR)
- **Production Build**: ~450–550KB gzipped
- **Code Splitting**: Enabled for vendor libraries

## 🚀 Bundle Analysis

### View Bundle Breakdown

```bash
# Build and generate analysis
npm run build

# Open bundle analysis (after build completes)
open dist/bundle-analysis.html
```

### Main Chunks

```
vendor-react.js       ~100KB  (React, React-DOM, React Router)
vendor-firebase.js    ~180KB  (Firebase SDK, Firestore)
3d-graphics.js        ~120KB  (Three.js, OGL, postprocessing)
ai.js                 ~60KB   (Gemini API client)
capacitor.js          ~30KB   (Capacitor plugins)
main.js               ~60KB   (App logic, screens, components)
```

### Optimization Targets

1. **Firebase SDK** (180KB) — Already optimized
   - Using modular imports (only needed modules)
   - Tree-shaking enabled in Vite

2. **Three.js** (180KB including dependencies) — Lazy-load only when needed
   - Currently: Loaded unconditionally
   - Fix: Lazy-load `Galaxy`, `Hyperspeed`, `LiquidEther` components
   - Savings: 40–50KB on screens that don't use 3D effects

3. **Framer Motion** (35KB) — Already optimized
   - Only motion components used; rest tree-shaken

## ⚡ Performance Optimizations (Implemented)

### Code Splitting

```js
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-firebase': ['firebase'],
        '3d-graphics': ['three', 'ogl', 'postprocessing'],
        'ai': ['@google/generative-ai'],
      },
    },
  },
},
```

### Lazy Loading Screens

```jsx
// Only Home, FindGig, Profile are eagerly loaded
import HomeScreen from './screens/HomeScreen';

// All others lazy-loaded
const AdminDashboard = lazy(() => import('./screens/AdminDashboard'));
const ChatScreen = lazy(() => import('./screens/ChatScreen'));

<Suspense fallback={<LoadingScreen />}>
  <AdminDashboard />
</Suspense>
```

### Debounced Firestore Streams

```js
// Prevents rapid re-renders from Firestore listeners
const debounce = (fn, ms = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};
```

### Image Optimization TODO

```bash
# Install image optimizer
npm install -D vite-plugin-imagemin

# Add to vite.config.js
import { createOptimizePlugin } from 'vite-plugin-imagemin';

plugins: [
  createOptimizePlugin({
    svg: {
      multipass: true,
      plugins: [
        { name: 'removeViewBox' },
      ],
    },
  }),
]
```

## 🔍 Performance Checklist

### Before Shipping

- [ ] Bundle size < 500KB gzipped
- [ ] Lighthouse score > 80
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 3s
- [ ] Cumulative Layout Shift < 0.1
- [ ] No console errors/warnings

### Run Lighthouse Audit

```bash
# Production build
npm run build:prod

# Preview
npm run preview

# Open http://localhost:4173 in Chrome
# Press Ctrl+Shift+I → Lighthouse tab → Analyze page load
```

## 🎯 Quick Wins (Easy Optimizations)

### 1. Lazy-Load 3D Backgrounds

**Current**: Three.js loaded on every page
**Fix**: Only load when needed

```jsx
// components/Galaxy.jsx
const Galaxy = lazy(() => import('./Galaxy'));

// screens/LoginScreen.jsx
<Suspense fallback={null}>
  <Galaxy />
</Suspense>
```

**Savings**: 40KB

### 2. Lazy-Load PDF Export

**Current**: jsPDF loaded unconditionally
**Fix**: Load only in ReportsScreen

```jsx
const { jsPDF } = await import('jspdf');
```

**Savings**: 20KB

### 3. Remove Unused Fonts

**Current**: Loading all Google fonts
**Check**: Which are actually used in CSS

```css
/* Remove if not used */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans');
```

### 4. Enable GZIP in Production

Ensure Firebase Hosting enables GZIP (default enabled):

```bash
firebase deploy
# Firebase Hosting automatically gzips responses
```

## 🔧 Advanced Optimizations

### Implement Service Worker

```bash
npm install workbox-cli
npx workbox wizard
```

Enable offline-first caching:
- Cache assets on first load
- Serve from cache, update in background
- Immediate Potential savings on repeat visits

### Implement Tree-Shaking

Verify unused exports are removed:

```bash
# Build analysis shows tree-shaken modules
npm run build
# Check dist/bundle-analysis.html for unused code
```

### Minify & Compress

Already enabled in Vite production build:

```js
// vite.config.js
build: {
  minify: 'terser',
  terserOptions: {
    compress: { drop_console: true },
  },
}
```

## 📈 Monitoring

### Monitor Bundle Size Over Time

Add to CI/CD:

```yaml
# .github/workflows/build-and-test.yml
- name: Check bundle size
  run: |
    SIZE_KB=$(du -sk dist/ | cut -f1)
    echo "Bundle: $SIZE_KB KB"
    if [ $SIZE_KB -gt 2048 ]; then
      echo "❌ Bundle exceeds 2MB"
      exit 1
    fi
```

### Real-Time Performance Monitoring

Add Sentry to track performance:

```js
// main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
});
```

## 🎯 Performance Goals (Roadmap)

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Bundle size | 500KB | <400KB | ⏳ Needs optimization |
| First load | 1.5s | <1s | ⏳ Dev server overhead |
| Lighthouse | 75 | 90+ | 🔴 To test |
| LCP | 2.5s | <2.5s | ⏳ To measure |
| CLS | 0.15 | <0.1 | 🔴 To test |
| FCP | 0.8s | <1s | ⏳ To measure |

## 🐛 Common Performance Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Slow initial load | Large bundles | Code split, lazy load |
| Slow navigation | Re-rendering | Memoize expensive components |
| High CPU usage | Unoptimized loops | Use `.filter().map()` chains efficiently |
| Memory leak | Unsubscribed listeners | Cleanup in useEffect return |
| Slow API calls | No pagination | Add cursor-based pagination |
| Flashy UI | Layout shifts | Skeleton screens, fixed heights |

## 🚀 Future Optimizations

1. **Implement Pagination** — Firestore queries currently fetch all docs
2. **Add CDN** — Serve assets from edge locations
3. **Implement Edge Caching** — Cache static assets
4. **Implement Web Workers** — Offload expensive computations
5. **Add Resource Hints** — `<link rel="preload">` for critical resources

## 📚 Resources

- [Vite Performance Guide](https://vitejs.dev/guide/ssr.html)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Webpack Bundle Analyzer](https://github.com/webpack-bundle-analyzer/webpack-bundle-analyzer)
