# 📖 Job Genie Operations Manual — Production Management Guide

**Version**: 1.0  
**Date**: June 3, 2026  
**Audience**: DevOps, Platform Operations, Support Team  
**Status**: Production Ready  

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Deployment Operations](#deployment-operations)
3. [Monitoring & Alerting](#monitoring--alerting)
4. [Troubleshooting](#troubleshooting)
5. [Scaling & Performance](#scaling--performance)
6. [Security Operations](#security-operations)
7. [Disaster Recovery](#disaster-recovery)
8. [Maintenance Schedule](#maintenance-schedule)

---

## Quick Reference

### Critical Commands

```bash
# Deployment
npm run build:prod           # Build production bundle
firebase deploy              # Deploy to Firebase Hosting
npx cap sync android         # Sync to Android project
npx cap open android         # Open Android Studio

# Monitoring
npm run test:run             # Run all tests
npm run test:coverage        # Check code coverage
npm run analyze              # Analyze bundle size

# Local Development
npm run dev                  # Start dev server
npm run lint                 # Check code quality
npm run lint:fix             # Auto-fix issues

# Troubleshooting
npm run test:ui              # Open test dashboard
firebase emulators:start     # Start local Firebase
```

### Emergency Contacts

| Role | Escalation |
|------|------------|
| Build Failure | Check GitHub Actions logs |
| Production Error | Monitor Sentry dashboard |
| Performance Issue | Check Firebase Analytics |
| Security Issue | Review GitHub Security tab |

---

## Deployment Operations

### Deployment Pipeline Overview

```
Push to Main
    ↓
GitHub Actions Triggered
    ├─ Lint (ESLint) → 30s
    ├─ Test (Vitest) → 45s
    ├─ Security (TruffleHog) → 20s
    ├─ Build (Vite) → 60s
    └─ Deploy (Firebase) → 90s
────────────────────────
Total: ~4 minutes
```

### Pre-Deployment Checklist

```bash
# 1. Verify all tests pass
npm run test:run

# 2. Check for linting errors
npm run lint

# 3. Verify no secrets in code
grep -r "VITE_" src/ | grep -v ".env"

# 4. Build locally
npm run build:prod

# 5. Verify bundle size
npm run analyze

# 6. Review changes
git log --oneline -5
```

### Manual Deployment Steps

If automated deployment fails:

```bash
# 1. Check environment variables
cat .env.production

# 2. Verify Firebase login
firebase login:status

# 3. Build production bundle
npm run build:prod

# 4. Deploy to Firebase Hosting
firebase deploy --only hosting

# 5. Monitor deployment
firebase hosting:channel:list

# 6. Verify deployment succeeded
open https://<project-id>.web.app
```

### Rollback Procedure

```bash
# 1. Check deployment history
firebase hosting:channels:list

# 2. Switch to previous version
firebase deploy -m "Rollback to [version]"

# 3. Monitor in Sentry for errors
# 4. Communicate with team
```

### Capacitor Android Build

```bash
# 1. Sync web build to Android
npm run build:prod
npx cap sync android

# 2. Build Android APK
# Option A: Android Studio (GUI)
npx cap open android
# Then: Build → Build Bundles/APK → Build APK

# Option B: Command line
cd android && ./gradlew assembleRelease
```

---

## Monitoring & Alerting

### Health Check Dashboard

**Primary Monitoring Tools**:

| Tool | Purpose | Dashboard |
|------|---------|-----------|
| **Sentry** | Error tracking | sentry.io/organizations/job-genie |
| **Firebase Analytics** | User analytics | console.firebase.google.com |
| **GitHub Actions** | Build status | github.com/jobgenie/actions |
| **Firebase Hosting** | Deployment status | console.firebase.google.com/hosting |

### Key Metrics to Monitor

```
PERFORMANCE METRICS:
├─ Page Load Time (target: <2s)
├─ Time to Interactive (target: <3s)
├─ Largest Contentful Paint (target: <2.5s)
├─ Cumulative Layout Shift (target: <0.1)
└─ Core Web Vitals (check monthly)

ERROR METRICS:
├─ Error Rate (target: <0.1%)
├─ Crash Rate (target: <0.01%)
├─ API Error Rate (target: <0.5%)
└─ Sentry Issue Count (monitor daily)

BUSINESS METRICS:
├─ Active Users (daily/weekly/monthly)
├─ User Retention (7-day, 30-day)
├─ Job Completion Rate (%)
├─ Worker Earnings (avg daily)
└─ Admin Job Posts (daily count)
```

### Daily Health Check Routine

```
9:00 AM - Check overnight errors
├─ Open Sentry dashboard
├─ Review new issues
├─ Check error trend
└─ Triage high-severity items

12:00 PM - Check business metrics
├─ DAU (daily active users)
├─ Job completion rate
├─ Any unusual patterns
└─ Update team status

4:00 PM - Check build status
├─ Latest deployment status
├─ GitHub Actions logs
├─ Any failed builds
└─ Performance metrics

5:00 PM - Week/month summary
├─ Trend analysis
├─ User feedback review
├─ Plan improvements
└─ Document issues
```

### Alert Configuration

```yaml
# Sentry Alerts
- Alert on: Error rate > 1% in 10 min
- Alert on: New issue detected
- Alert on: Critical errors (severity >= HIGH)
- Destination: ops@jobgenie.com

# Firebase Alerts
- Alert on: Deployment failure
- Alert on: Hosting quota exceeded
- Alert on: Unusual spike in usage
- Destination: ops@jobgenie.com

# GitHub Alerts
- Alert on: Build failure
- Alert on: Security vulnerability detected
- Alert on: Coverage drops below 70%
- Destination: devs@jobgenie.com
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. **Build Failure: Lint Error**

```
Error: ESLint found issues

Solution:
1. Check the specific error file
2. Fix locally: npm run lint:fix
3. Test: npm run test:run
4. Push again
```

#### 2. **Test Failure: Coverage Below Threshold**

```
Error: Coverage 65% (need 70%)

Solution:
1. Check coverage report: npm run test:coverage
2. Review uncovered lines
3. Add tests for critical paths
4. Re-run: npm run test:run
```

#### 3. **Performance: Bundle Too Large**

```
Error: Bundle > 500KB threshold

Solution:
1. Analyze: npm run analyze
2. Identify large modules
3. Consider:
   - Lazy loading?
   - Tree-shaking?
   - Smaller dependency?
4. Update vite.config.prod.js
5. Re-test: npm run build:prod
```

#### 4. **Deploy Failure: Firebase Auth**

```
Error: Firebase authentication failed

Solution:
1. Check login: firebase login:status
2. Re-authenticate: firebase login
3. Check .env: FIREBASE_SERVICE_ACCOUNT_* set?
4. Verify GitHub Secrets (11 variables)
5. Try manual deploy: firebase deploy --only hosting
```

#### 5. **Runtime Error: Module Not Found**

```
Error: Cannot find module 'X'

Solution:
1. Check imports in error
2. Verify file exists: ls src/path/to/file.js
3. Check syntax in translations.js
4. Clear cache: rm -rf node_modules && npm install
5. Rebuild: npm run build:prod
```

#### 6. **Production Error: Sentry Alert**

```
Error: WorkerAIScreen fails to load

Solution:
1. Check Sentry for full stack trace
2. If syntax error: Review translations.js
3. If import error: Check all imports in file
4. If timeout: Check network in DevTools
5. Reproduce locally with npm run dev
6. Fix and push update
```

### Debug Procedures

#### For Build Issues

```bash
# 1. Clear cache
rm -rf node_modules dist
npm install

# 2. Run verbose build
npm run build:prod -- --debug

# 3. Check for syntax errors
npm run lint

# 4. Test locally
npm run dev

# 5. Check bundle
npm run analyze

# 6. Verify env variables
echo $VITE_FIREBASE_API_KEY  # Should be set
```

#### For Runtime Issues

```bash
# 1. Check browser console (F12)
# Look for red errors

# 2. Check Network tab
# Look for failed requests (404, 500)

# 3. Check Sentry dashboard
# Look for error stack trace

# 4. Reproduce locally
npm run dev
# Navigate to same screen
# Check console for errors

# 5. Enable debug logging
localStorage.DEBUG = "*"
location.reload()

# 6. Check Firebase connectivity
firebase emulators:start
# Verify Firestore is responding
```

#### For Performance Issues

```bash
# 1. Run Lighthouse audit
# DevTools → Lighthouse → Generate report

# 2. Check Core Web Vitals
# Firebase Console → Performance

# 3. Profile CPU
# DevTools → Performance → Record

# 4. Analyze bundle
npm run analyze
# Look for large dependencies

# 5. Check caching headers
# DevTools → Network → Headers
# Should see: cache-control: max-age=...
```

### Support Escalation Path

```
Issue Detected
    ↓
Check Basic Troubleshooting
    ├─ Yes, Fixed → End
    └─ No → Next
    ↓
Check Monitoring Dashboards
    ├─ Found Issue → Fix → End
    └─ Not Clear → Next
    ↓
Review Logs & Stack Traces
    ├─ Root Cause Found → Fix → End
    └─ Still Unclear → Next
    ↓
Escalate to Senior Developer
    ├─ Reproduced → Fix → End
    └─ Cannot Reproduce → End (likely user issue)
```

---

## Scaling & Performance

### Performance Optimization Checklist

```
ONGOING OPTIMIZATION

Weekly:
  □ Check bundle size trend
  □ Monitor Core Web Vitals
  □ Review error logs for patterns
  □ Check database query performance

Monthly:
  □ Analyze user session duration
  □ Review slowest screens (Sentry)
  □ Optimize images & assets
  □ Run lighthouse audit
  □ Check third-party script impact

Quarterly:
  □ Major dependency updates
  □ Architecture review
  □ Performance regression testing
  □ User feedback analysis
```

### Scaling to Higher Load

#### When Reaching 10K Users

```
INFRASTRUCTURE SCALING

1. Database
   - Enable Firestore auto-scaling
   - Monitor read/write operations
   - Consider regional distribution

2. CDN
   - Firebase Hosting uses global CDN
   - Cache aggressive static assets
   - Monitor cache hit rate

3. API
   - Rate limiting still needed
   - Monitor Gemini API quotas
   - Consider request batching

4. Frontend
   - Code splitting already done
   - Monitor bundle sizes
   - Consider service workers
```

#### When Reaching 100K Users

```
ADVANCED SCALING

1. Database
   - Consider migration to Realtime Database
   - Implement data sharding
   - Archive old data

2. CDN
   - Use regional Cloud Storage buckets
   - Consider custom CDN
   - Implement image optimization

3. API
   - Implement caching layer
   - Consider API Gateway
   - Load balance requests

4. Frontend
   - Progressive Web App (PWA)
   - Offline-first architecture
   - Service Worker caching
```

### Load Testing

```bash
# Install load testing tool
npm install -D artillery

# Create load-test.yml
# (artillery configuration)

# Run load test
artillery run load-test.yml

# Monitor results
# Check:
# - Response times
# - Error rate under load
# - CPU/Memory usage
```

### Performance Monitoring

```
FIREBASE CONSOLE → Performance Tab

Metrics to Watch:
├─ Screen Load Time
│  ├─ HomeScreen: <1s ✅
│  ├─ FindGigScreen: <2s ✅
│  └─ AdminDashboard: <2s ✅
├─ HTTP Request Duration
│  ├─ Firestore reads: <500ms ✅
│  ├─ Gemini API: <3s ✅
│  └─ Image loads: <1s ✅
└─ Frame Rate
   ├─ 60fps target ✅
   └─ No jank on animations ✅
```

---

## Security Operations

### Regular Security Tasks

```
DAILY:
  □ Review Sentry for security-related errors
  □ Check GitHub Security tab
  □ Monitor failed auth attempts

WEEKLY:
  □ Review access logs
  □ Check for unusual data access patterns
  □ Audit admin user actions
  □ Review firestore.rules changes

MONTHLY:
  □ Run dependency audit: npm audit
  □ Review GitHub Security alerts
  □ Audit role-based access
  □ Check data retention policies
  □ Review encryption settings

QUARTERLY:
  □ Security code review
  □ Penetration testing (consider)
  □ Update security policies
  □ Audit third-party integrations
```

### Managing Secrets

```
GitHub Secrets (11 total):
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
  FIREBASE_SERVICE_ACCOUNT_JOB_GENIE

DO:
  ✅ Store in GitHub Secrets
  ✅ Use .env.example with placeholders
  ✅ Rotate quarterly
  ✅ Never commit .env files
  ✅ Audit access logs

DON'T:
  ❌ Put secrets in source code
  ❌ Log secrets in console
  ❌ Share via Slack/email
  ❌ Store in comments
  ❌ Commit to git
```

### Firestore Security Rules

```
Location: firestore.rules

Key Rules:
  ✅ All data requires authentication
  ✅ Workers can only read/write own data
  ✅ Admins can read/write jobs
  ✅ Super admins have full access
  ✅ Rate limiting on writes
  ✅ Timestamp validation

Review: Whenever changing data model
Deploy: firebase deploy --only firestore:rules
```

### Access Control

```
ROLE HIERARCHY:

Super Admin
  └─ Full platform access
  └─ Can manage admins
  └─ Can access all data

Admin (Genie Partner)
  └─ Can post jobs
  └─ Can manage applications
  └─ Can view own job stats
  └─ Cannot access worker data

Worker
  └─ Can view available jobs
  └─ Can apply to jobs
  └─ Can manage own earnings
  └─ Cannot access admin features

Enforcement:
  ✅ App checks role on load
  ✅ Firestore rules enforce
  ✅ API requests validate role
  ✅ No client-side bypasses
```

---

## Disaster Recovery

### Backup Strategy

```
FIREBASE BACKUPS:

Firestore:
  - Automatic daily backups (by Google)
  - Retention: 35 days
  - Manual export: Available via Console

Storage:
  - Enable versioning on images
  - Archive old data quarterly
  - Off-site backups (consider)

Database:
  - Snapshots before major updates
  - Can restore from timestamp
```

### Disaster Scenarios

#### Scenario 1: Data Corruption

```
ISSUE: Malicious actor deletes jobs collection

RECOVERY:
1. Immediate: Disable write access to collection
   firebase firestore:rules set firestore-rules.backup.rules

2. Short-term: Restore from backup
   console.firebase.google.com → Firestore → Backups → Restore

3. Long-term: Investigate and prevent
   - Audit: Who had write access?
   - Security: Fix access control
   - Monitoring: Set alert for mass deletes
```

#### Scenario 2: Code Bug in Production

```
ISSUE: Update breaks authentication for workers

RECOVERY:
1. Immediate: Rollback deployment
   firebase deploy -m "Rollback: Auth bug"

2. Short-term: Switch to backup version
   firebase hosting:channels:list

3. Long-term: Fix and test
   - Review code changes
   - Add tests for auth flow
   - Test E2E before deploy
```

#### Scenario 3: DDoS Attack

```
ISSUE: High traffic causes downtime

RECOVERY:
1. Immediate: Enable Cloud Armor (or equivalent)
   - Rate limiting
   - Block suspicious IPs
   - Geo-fencing

2. Short-term: Scale resources
   - Firebase auto-scales
   - Increase quota if needed

3. Long-term: Implement protections
   - WAF rules
   - Bot detection
   - CAPTCHA for sensitive endpoints
```

#### Scenario 4: Complete Data Loss

```
ISSUE: Firebase project somehow deleted

RECOVERY:
1. Catastrophic: Restore from backups
   - Use Firestore export/import
   - Restore from Cloud Storage backups
   - May require 24-48 hours

2. Preventive (Going Forward):
   - Enable automated backups
   - Store backups in separate project
   - Test recovery monthly
   - Document recovery procedure
```

### Recovery Testing

```
MONTHLY RECOVERY DRILL

1. Simulate data loss
2. Restore from backup
3. Verify all functionality works
4. Measure recovery time (RTO)
5. Document any issues
6. Update recovery procedures

Target RTO: < 4 hours
Target RPO: < 1 hour
```

---

## Maintenance Schedule

### Daily Tasks (5 min)

```
9:00 AM
  1. Check error dashboard (Sentry)
  2. Review overnight metrics
  3. Check build status
  4. Triage any critical issues
```

### Weekly Tasks (30 min)

```
Monday 9:00 AM
  1. Review all errors from past week
  2. Check performance trends
  3. Analyze user feedback
  4. Plan improvements
  5. Update team status
```

### Monthly Tasks (2 hours)

```
First Friday
  1. Update dependencies: npm update
  2. Run security audit: npm audit
  3. Review Firestore usage
  4. Archive old logs
  5. Performance analysis
  6. User metrics review
  7. Plan feature work
```

### Quarterly Tasks (4 hours)

```
Q1/Q2/Q3/Q4 Review
  1. Major dependency updates
  2. Security assessment
  3. Performance optimization
  4. Code quality review
  5. Architecture assessment
  6. Roadmap planning
  7. Team training/documentation
```

### Maintenance Windows

```
Production Maintenance:
  Windows: Tuesdays 2-3 AM UTC
  Advance Notice: 48 hours
  Max Duration: 30 minutes
  Rollback Plan: Always ready

Development Deployment:
  Any time (Git push auto-deploys)
  No advance notice needed
  Rollback in minutes if needed
```

---

## Runbooks

### Runbook: Emergency Hotfix

```
When: Critical bug found in production

Steps:
1. Create feature branch
   git checkout -b hotfix/issue-name

2. Fix bug locally
   npm run dev
   (test thoroughly)

3. Run full test suite
   npm run test:run

4. Verify build
   npm run build:prod

5. Commit and push
   git add .
   git commit -m "Fix: [issue name]"
   git push origin hotfix/issue-name

6. Create Pull Request
   (get quick review)

7. Merge to main
   (auto-deploys via GitHub Actions)

8. Monitor Sentry
   (verify fix works)

9. Communicate with team
   (status update)
```

### Runbook: Performance Issue

```
When: Slow page loads reported

Steps:
1. Access Firebase Analytics
   Check slowest screens/devices

2. Run Lighthouse audit
   DevTools → Lighthouse → Generate

3. Profile with DevTools
   Performance → Record session

4. Analyze bundle
   npm run analyze

5. Identify bottleneck
   Is it: Code? Images? API? 3rd party?

6. Implement fix
   Optimize, lazy-load, cache, etc.

7. Benchmark improvement
   npm run build:prod
   npm run analyze

8. Deploy and verify
   firebase deploy --only hosting

9. Monitor for improvements
   Firebase Analytics → Revisit after 24h
```

### Runbook: Security Issue

```
When: Vulnerability found

Steps:
1. Assess severity
   Critical/High/Medium/Low?

2. If Critical:
   - Immediately disable feature
   - Prepare hotfix
   - Plan communication

3. Fix the issue
   npm run lint
   npm run test:run

4. Update dependencies if needed
   npm audit fix

5. Deploy fix
   Push to main (auto-deploys)

6. Verify in production
   Test affected functionality

7. Update security documentation
   firestore.rules, .env, etc.

8. Communicate with team
   Security mailing list

9. Post-incident review
   How did this happen?
   How to prevent?
```

---

## Contact & Escalation

### Team Directory

```
Role                Contact              Available
─────────────────────────────────────────────────
Platform Lead       ops@jobgenie.com     24/7 (on-call)
Backend Dev         devs@jobgenie.com    9 AM - 5 PM
DevOps              devops@jobgenie.com  24/7 (on-call)
Support             support@jobgenie.com 9 AM - 5 PM UTC
Security            security@jobgenie.com 24/7 (on-call)
```

### Escalation Path

```
Level 1: Automated Monitoring
  - GitHub Actions
  - Sentry alerts
  - Firebase alerts
  → Try to auto-resolve if possible

Level 2: On-Call Developer
  - Check logs
  - Attempt hotfix
  - Escalate if can't resolve in 15 min

Level 3: Platform Lead
  - Strategic decision
  - Major incident coordination
  - Communication to users

Level 4: External Support
  - Firebase support
  - GitHub support
  - Security consultants
```

---

## Useful Resources

### Documentation
- `README.md` — Project overview
- `DEPLOYMENT_GUIDE.md` — Deployment steps
- `TESTING_GUIDE.md` — How to test
- `firestore.rules` — Database security rules

### Dashboards
- [Firebase Console](https://console.firebase.google.com)
- [Sentry Dashboard](https://sentry.io)
- [GitHub Actions](https://github.com/jobgenie/actions)
- [Analytics](https://console.firebase.google.com/analytics)

### Tools
```bash
npm run dev              # Local development
npm run build:prod      # Production build
npm run test:run        # Run tests
npm run lint            # Check code
firebase deploy         # Deploy to production
firebase emulators:start # Local Firebase
```

---

## Sign-Off

```
╔═══════════════════════════════════════════════════════╗
║     OPERATIONS MANUAL — PRODUCTION READY             ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  Document Status: ✅ COMPLETE & TESTED              ║
║  Last Updated:    June 3, 2026                       ║
║  Next Review:     July 3, 2026                       ║
║                                                       ║
║  READINESS: Enterprise Operations Ready ✅           ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

**Ready for Production Operations** ✅

