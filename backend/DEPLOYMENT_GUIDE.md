# Job Genie Deployment Guide

Complete guide to deploying Job Genie to production on Firebase Hosting.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Pre-Deployment Checklist](#pre-deployment-checklist)
5. [Automated Deployment (GitHub Actions)](#automated-deployment-github-actions)
6. [Manual Deployment](#manual-deployment)
7. [Verification & Monitoring](#verification--monitoring)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Tools
- **Node.js 18+** — Install from [nodejs.org](https://nodejs.org)
- **npm 9+** — Included with Node.js
- **Firebase CLI** — Install: `npm install -g firebase-tools`
- **Git** — Install from [git-scm.com](https://git-scm.com)
- **GitHub account** — For CI/CD pipeline

### Firebase Setup
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Create Firestore database (in US multi-region, production mode)
3. Enable Authentication methods:
   - Google Sign-In
   - Phone Number (optional)
4. Create web app in Firebase console
5. Enable Hosting in Firebase project

### GitHub Setup
1. Fork/clone the repository
2. Add secrets to GitHub repository (Settings → Secrets)
3. Create service account for Firebase authentication

---

## Initial Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
   - Project name: `job-genie`
   - Enable Google Analytics (optional)
3. Wait for project creation
4. Copy Project ID (shown in settings)

### Step 2: Set Up Firebase Hosting

```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init hosting

# When prompted:
# - Select your Firebase project
# - Public directory: dist
# - Configure as single-page app: Yes
# - Overwrite dist/index.html: No (we have our own)
```

This creates `firebase.json` and `.firebaserc`.

### Step 3: Enable Firestore

1. Go to Firebase Console → Firestore Database
2. Create database
   - Location: `us-central1` (multi-region recommended)
   - Rules: Start in Production Mode
   - Deploy rules from `firestore.rules`

### Step 4: Enable Authentication

1. Go to Firebase Console → Authentication
2. Set Sign-In Methods
   - Google: Enable
   - Phone: Enable (optional)
   - Anonymous: Disable

### Step 5: Create Service Account

1. Go to Firebase Console → Project Settings
2. Click "Service Accounts" tab
3. Click "Generate New Private Key"
4. Save as `firebase-key.json` (keep secret!)
5. Convert to base64 for GitHub Secrets:
   ```bash
   cat firebase-key.json | base64 | tr -d '\n'
   ```

---

## Environment Configuration

### Local Development

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Firebase credentials
nano .env
```

**Required variables for local dev**:
```dotenv
VITE_FIREBASE_API_KEY=<from Firebase Console>
VITE_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
VITE_FIREBASE_APP_ID=<app-id>
VITE_GEMINI_API_KEY=<optional, for AI features>
VITE_USE_MOCK=false          # Use real Firebase
VITE_E2E_MODE=false          # Disable test mode
```

### Production (CI/CD)

Create `.env.production`:
```dotenv
VITE_USE_MOCK=false
VITE_E2E_MODE=false
# All other variables come from GitHub Secrets
```

### GitHub Actions Secrets

1. Go to GitHub → Settings → Secrets and variables → Actions
2. Add these secrets:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_GOOGLE_WEB_CLIENT_ID
VITE_GEMINI_API_KEY
VITE_SENTRY_DSN
FIREBASE_SERVICE_ACCOUNT_JOB_GENIE   (base64 service account JSON)
FIREBASE_PROJECT_ID
```

---

## Pre-Deployment Checklist

### Code Quality
- [ ] Run linter: `npm run lint`
- [ ] Fix any issues: `npm run lint -- --fix`
- [ ] No console errors in dev server

### Testing
- [ ] Run all tests: `npm run test:run`
- [ ] Coverage meets threshold: `npm run test:coverage`
- [ ] All tests passing (green)

### Build
- [ ] Build succeeds: `npm run build:prod`
- [ ] Build size reasonable (< 1MB)
- [ ] No warnings in build output

### Security
- [ ] `.env` has no real secrets (use `.env.example` template)
- [ ] `.env` not committed to git
- [ ] GitHub Secrets are set up correctly
- [ ] Firestore Security Rules reviewed and deployed
- [ ] Firebase project has strong auth methods

### Performance
- [ ] Bundle analysis checked: `npm run build:prod`
- [ ] Images optimized (< 100KB each)
- [ ] No unused dependencies

### Content
- [ ] README.md updated
- [ ] CHANGELOG.md updated (optional)
- [ ] API documentation up-to-date
- [ ] Release notes prepared

### Firebase
- [ ] Firestore database created
- [ ] Authentication methods enabled
- [ ] Security rules deployed
- [ ] Hosting configured

---

## Automated Deployment (GitHub Actions)

### GitHub Actions Workflow

The pipeline in `.github/workflows/build-and-test.yml` automatically:

1. **Lint & Code Quality** ✅
   - ESLint checks for code issues
   - Fails on errors, warns on issues

2. **Unit Tests** ✅
   - All tests must pass
   - Coverage report generated
   - Uploaded to Codecov

3. **Build Production** ✅
   - Production build created
   - Bundle size analyzed
   - Artifacts archived

4. **Security Scan** ✅
   - npm audit for vulnerabilities
   - Secret scanning with TruffleHog

5. **E2E Tests** (optional) ✅
   - Cypress tests run (main branch only)
   - Videos/screenshots on failure

6. **Deploy to Firebase** ✅ (main branch only)
   - Production build deployed
   - Live at: `https://<project-id>.web.app`

### Triggering Deployment

**Automatic**:
- Push to `main` branch → Full pipeline + Deploy
- Push to `develop` branch → Lint + Test + Build (no deploy)
- Pull requests → Lint + Test + Build (no deploy)

**Manual deployment** (if needed):
```bash
npm run build:prod
firebase deploy --token $FIREBASE_TOKEN
```

### Viewing Pipeline Status

1. Go to GitHub → Actions
2. Click latest workflow run
3. View logs for each job
4. Check for failures

### Rollback on Failure

If deployment fails:
1. Review error logs in GitHub Actions
2. Fix the issue locally
3. Commit and push again
4. Pipeline automatically redeploys

---

## Manual Deployment

### Option 1: Firebase CLI (Recommended)

```bash
# Build production
npm run build:prod

# Login to Firebase
firebase login

# Deploy hosting only
firebase deploy --only hosting

# Deploy with specific project
firebase deploy --only hosting -P production

# View deployment history
firebase hosting:channel:list
```

### Option 2: Vercel (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# View deployments
vercel ls
```

### Option 3: Netlify (Alternative)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## Verification & Monitoring

### Test Deployed App

1. **Visit deployed URL**
   ```
   https://<your-project-id>.web.app
   ```

2. **Test key flows**
   - [ ] Login works (Google auth)
   - [ ] Can browse jobs
   - [ ] Can apply to jobs
   - [ ] Earnings page loads
   - [ ] Profile page accessible

3. **Check browser console**
   - No JavaScript errors
   - No 404 errors for assets

### Monitor Performance

```bash
# View Firebase hosting analytics
firebase hosting:channel:open

# Check real-time analytics
# Firebase Console → Hosting → Analytics
```

**Performance metrics to monitor**:
- Page load time < 3 seconds
- Time to Interactive < 5 seconds
- Cumulative Layout Shift < 0.1

### Set Up Error Tracking (Sentry)

1. Create [Sentry](https://sentry.io) account
2. Create new project for Job Genie
3. Set `VITE_SENTRY_DSN` to Sentry DSN
4. Errors automatically reported to Sentry

```bash
npm install @sentry/react
```

In `main.jsx`:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

### Real-time Monitoring

**Firebase Console**:
- Firebase Console → Hosting → Analytics & Reports
- View real-time requests, errors, performance

**Google Analytics** (if enabled):
- Real user metrics
- Session duration
- Conversion tracking

---

## Troubleshooting

### Deployment Fails: "Cannot find module"

**Problem**: Missing dependencies  
**Solution**:
```bash
npm ci  # Clean install
npm run build:prod
```

### Deployment Fails: "PERMISSION_DENIED"

**Problem**: Firebase token expired or invalid  
**Solution**:
```bash
firebase logout
firebase login
firebase deploy --token $(firebase login:ci)
```

### Deployment Fails: Security Rules

**Problem**: Firestore Security Rules misconfigured  
**Solution**:
```bash
# Deploy rules explicitly
firebase deploy --only firestore:rules

# Verify rules deployed
firebase firestore:indexes:list
```

### App Crashes in Production

**Check logs**:
1. Firebase Console → Functions → Logs
2. Sentry → Issues (if configured)
3. Browser DevTools → Network/Console

**Common causes**:
- Missing Firebase API key
- Firestore rules blocking read/write
- Missing environment variables
- Third-party API failures

### Slow Loading in Production

**Check**:
1. Bundle size: `npm run build:prod 2>&1 | grep "is larger"`
2. Network speed: DevTools → Network tab
3. Firebase cold start: First request might be slow

**Optimize**:
- Enable compression on server
- Use CDN caching headers
- Lazy-load heavy components

---

## Rollback Procedures

### Rollback to Previous Version

**Firebase Hosting keeps deployment history**:

```bash
# List recent deployments
firebase hosting:channel:list

# Rollback to specific deployment
firebase hosting:clone staging production

# Or manually deploy previous version
git checkout <previous-commit>
npm run build:prod
firebase deploy --only hosting
```

**Using GitHub releases**:
1. Go to GitHub → Releases
2. Find previous release tag
3. Checkout: `git checkout <tag>`
4. Rebuild and deploy

### Emergency Rollback

If production is broken:

```bash
# Immediate: Deploy from last working commit
git log --oneline | head -5  # Find recent commits
git checkout <commit-hash>
npm install
npm run build:prod
firebase deploy --only hosting --force
```

### Scheduled Rollback

```bash
# GitHub Actions: Create manual workflow
# .github/workflows/rollback.yml

name: Manual Rollback
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Git commit to deploy'
        required: true
```

---

## Maintenance & Updates

### Weekly Checks

- [ ] Monitor Sentry for errors
- [ ] Check Firebase usage/quota
- [ ] Review performance metrics

### Monthly Checks

- [ ] Update dependencies: `npm update`
- [ ] Run security audit: `npm audit`
- [ ] Review Firestore indexes/performance
- [ ] Check SSL certificate (auto-renewed)

### Quarterly Reviews

- [ ] Full security audit
- [ ] Performance optimization
- [ ] Cost analysis (Firebase usage)
- [ ] User feedback integration

---

## Production Checklist (Before First Deploy)

- [ ] Firebase project created and configured
- [ ] Firestore database deployed (production mode)
- [ ] Authentication methods enabled
- [ ] Security rules deployed
- [ ] Service account created
- [ ] GitHub repository created
- [ ] GitHub Secrets configured (all env vars)
- [ ] `.env.production` configured
- [ ] All tests passing
- [ ] Production build succeeds
- [ ] README and docs updated
- [ ] CHANGELOG created
- [ ] Team trained on deployment process

---

## Additional Resources

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)

---

**Last Updated**: June 2024  
**Maintained by**: Job Genie DevOps Team
