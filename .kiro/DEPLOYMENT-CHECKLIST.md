# 🚀 Production Deployment Checklist

Use this checklist before deploying to production.

---

## Pre-Deployment (Week Before)

### Security Review
- [ ] Review `.env.production` for all required fields
  - [ ] Firebase credentials set
  - [ ] Gemini API key configured
  - [ ] Sentry DSN added (if using monitoring)
- [ ] Verify no hardcoded secrets in source code
  ```bash
  grep -r "api.key\|SECRET\|PROD_" src/
  ```
- [ ] Rotate any exposed credentials
- [ ] Review Firebase Security Rules
  ```bash
  firebase rules:test
  ```

### Testing
- [ ] Run full test suite locally
  ```bash
  npm run test:run
  ```
- [ ] Verify all tests pass (37 tests minimum)
- [ ] Check test coverage
  ```bash
  npm run test:coverage
  ```
- [ ] Manual testing on staging environment
  - [ ] Worker login flow
  - [ ] Admin dashboard
  - [ ] Job application
  - [ ] Geofence check-in
  - [ ] AI chat

### Performance
- [ ] Build and analyze bundle
  ```bash
  npm run build:prod
  open dist/bundle-analysis.html
  ```
- [ ] Verify bundle size < 500KB gzipped
- [ ] Test Lighthouse (target > 80)
  ```bash
  npm run preview
  # Open http://localhost:4173 in Chrome
  # DevTools → Lighthouse → Analyze page load
  ```
- [ ] Test on slow network (Chrome DevTools → Throttling)
- [ ] Verify mobile performance (Android device/emulator)

### Firebase
- [ ] Deploy Firestore rules
  ```bash
  firebase deploy --only firestore:rules
  ```
- [ ] Deploy Firestore indexes
  ```bash
  firebase deploy --only firestore:indexes
  ```
- [ ] Verify Firebase credentials are valid
- [ ] Test real Firestore read/write permissions
- [ ] Set up usage alerts
  - [ ] Firestore reads limit
  - [ ] Firestore writes limit
  - [ ] Cloud Functions invocations limit

### Documentation
- [ ] README is current
- [ ] Runbooks documented for common issues
- [ ] Team trained on new processes
- [ ] Deployment procedure documented

---

## Day Before Deployment

### Final Checks
- [ ] CI/CD pipeline passing on main branch
  ```bash
  git push origin main  # Verify GitHub Actions
  ```
- [ ] All team members aware of deployment
- [ ] Rollback plan documented
- [ ] Team available for monitoring

### Build & Artifacts
- [ ] Trigger production build
  ```bash
  npm run build:prod
  ```
- [ ] Verify `dist/` folder exists and is not empty
- [ ] Verify source maps are disabled (no `.map` files)
- [ ] Archive build artifacts
  ```bash
  zip -r genie-prod-$(date +%Y%m%d).zip dist/
  ```

---

## Deployment Day

### Pre-Launch (1 hour before)
- [ ] Team standup scheduled
- [ ] Monitoring dashboard prepared
- [ ] Sentry/error tracking ready
- [ ] Firebase console open and monitored
- [ ] Firestore quota viewer visible
- [ ] Communication channel open (Slack/Teams)

### Launch (30 minutes)
- [ ] Deploy to Firebase Hosting
  ```bash
  npm run build:prod
  firebase deploy --only hosting
  ```
- [ ] Verify deployment successful
  ```bash
  # Check Firebase Console > Hosting
  # Verify version deployed and active
  ```
- [ ] Test production URL
  - [ ] Page loads without errors
  - [ ] No console errors
  - [ ] Worker login works
  - [ ] Admin login works
  - [ ] Basic features work

### Monitor (1 hour post-deployment)
- [ ] Check error tracking (Sentry)
  - [ ] No critical errors
  - [ ] Error rate < 0.1%
- [ ] Check performance metrics
  - [ ] Page load time normal
  - [ ] No timeout errors
- [ ] Check Firebase metrics
  - [ ] Firestore reads/writes normal
  - [ ] No spike in errors
  - [ ] Quota usage acceptable
- [ ] Gather team feedback
- [ ] Monitor user reports (support email/chat)

### Post-Launch (Day 1)
- [ ] Continue monitoring error rates
- [ ] Check user engagement metrics
- [ ] Verify no regressions
- [ ] Confirm no unexpected charges
- [ ] Update status page

---

## Rollback Plan (If Needed)

### Quick Rollback (< 5 min)
```bash
# Revert to previous Firebase Hosting version
firebase hosting:channel:deploy previous-version

# Or manually select previous version in Firebase Console
# Hosting > Manage custom domains > select version
```

### Full Rollback (If major issue)
1. Disable app in Firebase
2. Notify all users
3. Revert code on main branch
4. Deploy previous stable version
5. Investigate root cause
6. Plan hotfix

### Communication
- [ ] Notify support team immediately
- [ ] Prepare customer communication
- [ ] Post status update on status page
- [ ] Escalate if needed

---

## Post-Deployment (1 Week)

### Monitoring
- [ ] Daily check of error rates
- [ ] Performance metrics stable
- [ ] No unusual Firebase costs
- [ ] User feedback positive

### Updates
- [ ] Update deployment date in README
- [ ] Document any issues encountered
- [ ] Update runbooks if needed
- [ ] Schedule retrospective

### Cleanup
- [ ] Remove temporary branches
- [ ] Archive old build artifacts (keep 1 month)
- [ ] Update deployment history log

---

## Deployment Runbook

### Environment Setup

```bash
# 1. Clone and setup
git clone <repo>
cd genie-gen
npm install

# 2. Configure production environment
cp .env.production .env

# 3. Verify credentials
cat .env | grep -v "^#"  # Review (don't share!)
```

### Build Process

```bash
# 1. Run tests
npm run test:run

# 2. Build production
npm run build:prod

# 3. Verify build
ls -lh dist/
du -sh dist/

# 4. Analyze bundle (optional)
npm run build:prod
open dist/bundle-analysis.html
```

### Deployment

```bash
# 1. Login to Firebase
firebase login

# 2. Deploy rules & indexes (optional)
firebase deploy --only firestore:rules,firestore:indexes

# 3. Deploy hosting
firebase deploy --only hosting

# 4. Verify deployment
firebase hosting:channels:list
```

### Post-Deployment Verification

```bash
# 1. Check deployment status
firebase deploy --status

# 2. Test production URL
curl -I https://job-genie-5e3ea.web.app/

# 3. Check logs
firebase functions:log
```

---

## Monitoring Stack

### Firebase Console
- Dashboard: `console.firebase.google.com`
- Monitor: Firestore > Realtime > Usage
- Logs: Functions > Logs

### GitHub Actions
- Workflows: `.github/workflows/`
- Status: GitHub repo > Actions tab

### Sentry (Optional)
- Error tracking: Sentry dashboard
- Configure alerts for critical errors
- Daily digest email

### Uptime Monitoring (Optional)
- Setup StatusPage.io or similar
- Monitor production URL hourly
- Alert if down > 5 minutes

---

## Troubleshooting

### "Deploy failed: Permission denied"
**Solution**: Check Firebase credentials
```bash
firebase logout
firebase login
firebase deploy
```

### "Functions timeout"
**Solution**: Check Cloud Functions
```bash
firebase functions:log --limit 50
# Check for slow operations
```

### "Firestore quota exceeded"
**Solution**: Review usage
```bash
# Firebase Console > Firestore > Usage
# Check for:
#  - N+1 queries
#  - Streaming listeners
#  - Batch operations
```

### "Users complaining about slowness"
**Solution**: Check performance
```bash
# Lighthouse: https://web.dev/measure/
# Check Core Web Vitals
# Review bundle size: dist/bundle-analysis.html
```

### "MockFirestore error in production"
**Solution**: Verify build configuration
```bash
# Check .env.production
cat .env.production | grep VITE_USE_MOCK
# Should be: VITE_USE_MOCK=false

# Rebuild with correct env
npm run build:prod
firebase deploy
```

---

## Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Tech Lead | [Name] | [Phone] | [Email] |
| DevOps | [Name] | [Phone] | [Email] |
| Support | [Name] | [Phone] | [Email] |

---

## Sign-Off

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Reviewed By**: _______________  
**Status**: [ ] Success [ ] Rollback [ ] Issues

**Notes**: 
___________________________________________________________________
___________________________________________________________________

---

## Quick Reference

**Deployment Command**:
```bash
npm run build:prod && firebase deploy --only hosting
```

**Rollback Command**:
```bash
firebase hosting:channel:deploy <previous-version>
```

**Check Status**:
```bash
firebase deploy --status
```

**View Logs**:
```bash
firebase functions:log --limit 50
```

---

Last Updated: June 3, 2026
