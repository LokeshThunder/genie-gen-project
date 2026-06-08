# ✅ Actionable TODO List - What to Do Next

**Last Updated**: June 5, 2026  
**Status**: Ready for immediate action  
**Estimated Time**: 2-20 hours (depending on depth)

---

## 🎯 TODAY/TOMORROW (Next 2-4 hours)

### Must Do (Completes the quick wins)
- [ ] **Wrap 3D components with enable3D flag** (20 min)
  - File: `src/App.jsx`
  - Find: Where Galaxy, Hyperspeed, LiquidEther are rendered
  - Add: `{enable3D && <Component />}` condition
  - Test: Load app on Galaxy A11 or browser DevTools (low-end phone emulation)
  - Impact: Completes device detection optimization

- [ ] **Test on real device** (30 min)
  - Use: Galaxy A11, Redmi Note 8, or similar 2GB RAM phone
  - Check: App loads faster, no 3D effects on low-end
  - Monitor: Battery drain, memory usage
  - Result: Verify 50-80% speed improvement

- [ ] **Run build and verify no errors** (10 min)
  - Command: `npm run build`
  - Check: Output shows code splitting working (dist size < 500KB gzipped)
  - Verify: No build warnings or errors
  - Result: Ready for staging deployment

### Should Do (Adds pagination UX)
- [ ] **Implement pagination UI in FindGigScreen** (1-1.5 hours)
  - File: `src/screens/FindGigScreen.jsx`
  - Add state: `const [lastJobDoc, setLastJobDoc] = useState(null);`
  - Add function: `loadMore = async () => { ... }`
  - Add button: `{hasMore && <button>📥 Load More</button>}`
  - Test: Scroll job list, click "Load More", verify more jobs load
  - Impact: Enables infinite scroll, reduces initial memory load

---

## 📱 THIS WEEK (Next 2-3 days)

### High Priority - Security & Stability
- [ ] **Fix WebGL memory leaks** (2 hours)
  - File 1: `src/components/Galaxy.jsx` (line ~340, cleanup section)
    - Add: WebGL context release code
    - Add: `gl.getExtension('WEBGL_lose_context').loseContext()`
  - File 2: `src/components/Hyperspeed.jsx` (line ~1200, cleanup)
    - Add: Renderer disposal and context cleanup
  - File 3: `src/components/LiquidEther/LiquidEther.jsx` (cleanup method)
    - Add: Event listener removal
  - Test: Navigate between screens 20+ times, no crash
  - Impact: Eliminates OOM crashes

- [ ] **Add rate limiting on mutations** (2 hours)
  - File: `src/services/firestoreService.js`
  - Find functions: `createJob()`, `submitRating()`, `createDispute()`, `markAttendance()`
  - Add: `withRateLimit(limiterKey, userId, maxPerHour, callback)`
  - Example: Max 5 jobs/hour, 20 ratings/day
  - Test: Try creating job 6 times/hour, should be rate limited
  - Impact: Prevents spam, protects database

- [ ] **Update streamAttendance() calls** (30 min)
  - File: `src/screens/AttendanceScreen.jsx`
  - Find: `streamAttendance(callback)`
  - Change: `streamAttendance(callback, onError, user?.uid)`
  - Impact: Only loads current user's attendance (75% fewer reads)

### Medium Priority - Performance
- [ ] **Performance testing with Lighthouse** (1 hour)
  - Tool: Chrome DevTools → Lighthouse
  - Run: Mobile audit
  - Target: Score 85+ (was 65)
  - Check metrics:
    - FCP (First Contentful Paint): < 2 seconds ✓
    - LCP (Largest Contentful Paint): < 3 seconds ✓
    - CLS (Cumulative Layout Shift): < 0.1 ✓
  - Report: Lighthouse results

- [ ] **Test on 3G network** (30 min)
  - Tool: Chrome DevTools → Network → Slow 3G
  - Action: Open app, load jobs, navigate screens
  - Target: All actions complete in < 5 seconds
  - Monitor: Network tab for unnecessary requests
  - Impact: Verify mobile performance

---

## 🚀 NEXT WEEK (Sprint 1 - Days 3-7)

### Feature Development - Enhanced Quick Actions

- [ ] **Create QuickActionBar component** (2 hours)
  - File: `src/components/QuickActionBar.jsx` (NEW)
  - Components: QuickActionButton, QuickActionGrid
  - Props: actions[], onActionClick
  - Styling: Responsive grid, animations with Framer Motion
  - Test: Actions render, clickable, responsive

- [ ] **Create useContextualQuickActions hook** (1.5 hours)
  - File: `src/hooks/useContextualQuickActions.js` (NEW)
  - Logic: Select actions based on app state
  - States:
    - `activeShift`: Show [Check-In, Tasks, Timer, Help]
    - `balance > 100`: Show [Jobs, Payout, Challenges, Referral]
    - Default: Show [Jobs, My Jobs, Earnings, Genie AI]
  - Test: State changes, actions update correctly

- [ ] **Implement Quick Apply** (2 hours)
  - File: `src/screens/JobDetailsScreen.jsx` (UPDATE)
  - Feature: Pre-fill worker profile, show match score
  - Actions: One-tap application submission
  - Test: Apply to job, submit, verify in admin

- [ ] **Implement Quick Check-In** (1.5 hours)
  - File: `src/screens/AttendanceScreen.jsx` (UPDATE)
  - Feature: Auto-detect GPS, show distance
  - Actions: One-tap check-in confirmation
  - Test: Check in with GPS, verify location saved

- [ ] **Implement Instant Payout** (1.5 hours)
  - File: `src/screens/EarningsScreen.jsx` (UPDATE)
  - Feature: Show available balance, fee breakdown
  - Actions: Initiate instant withdrawal
  - Test: Withdraw, verify transaction status

### Security & Reliability
- [ ] **Add Firebase emulator guard** (30 min)
  - File: `src/services/firebaseConfig.js`
  - Add: Check if emulator enabled in production → throw error
  - Test: Try to enable emulator with `PROD` flag → error

- [ ] **Enhance Firestore security rules** (1 hour)
  - File: `firestore.rules` (UPDATE)
  - Add: Prevent workers from modifying status/wage fields
  - Add: Prevent self-approval of applications
  - Test: Try to update application status as worker → denied

- [ ] **Add offline detection** (1 hour)
  - File: `src/hooks/useOfflineDetection.js` (NEW)
  - Hook: Detect navigator.onLine changes
  - UI: Show offline banner when disconnected
  - Test: Toggle network in DevTools, banner appears

---

## 📊 FOLLOWING 1-2 WEEKS (Sprint 2)

### Major Features
- [ ] **Complete Quick Actions (4 more)**
  - [ ] Support & Help (24/7 chat)
  - [ ] Skill Boost (micro-courses)
  - [ ] Referral Program (share code)
  - [ ] Notifications (alerts)

- [ ] **Gamification System**
  - [ ] Streak tracking
  - [ ] Achievement badges (6+ badges)
  - [ ] Level progression
  - [ ] Leaderboard updates

- [ ] **Advanced Features**
  - [ ] Smart job matching
  - [ ] Earnings dashboard
  - [ ] Performance & reputation system

### Testing & Coverage
- [ ] **Expand test suite** (75+ new tests)
  - [ ] FirestoreService tests (30)
  - [ ] aiService tests (15)
  - [ ] Authentication tests (10)
  - [ ] Geofencing tests (8)
  - [ ] Attendance tests (12)

- [ ] **Integration tests**
  - [ ] Job application flow
  - [ ] Check-in/check-out flow
  - [ ] Earnings calculation
  - [ ] Admin dashboard

---

## 🎯 PRIORITIZATION MATRIX

### Do First (Highest Impact, Low Risk)
1. ✅ Wrap 3D with enable3D (20 min, 50% speed gain)
2. ✅ Test on real device (30 min, validates improvements)
3. ✅ Implement pagination UI (1.5h, better UX)
4. ⭐ Fix memory leaks (2h, prevents crashes)
5. ⭐ Rate limiting (2h, security)

### Do Next (High Impact, Medium Risk)
6. Quick Apply feature (2h, +25% conversion)
7. Quick Check-In (1.5h, UX improvement)
8. Instant Payout (1.5h, feature request)
9. Offline detection (1h, reliability)

### Do Later (Nice to Have)
10. Additional quick actions (Support, Skill, Referral)
11. Gamification system
12. Advanced features
13. Complete test expansion

---

## 🧪 TESTING CHECKLIST

### Before Each Deployment

- [ ] **Local Testing**
  - [ ] Build succeeds: `npm run build`
  - [ ] No console errors: Check DevTools console
  - [ ] App loads: Visit `http://localhost:5173`
  - [ ] Navigation works: Test all screens

- [ ] **Performance Testing**
  - [ ] Lighthouse score: 85+
  - [ ] Load time: < 4 seconds on 4G
  - [ ] Memory: < 120MB
  - [ ] FPS: 50+ FPS on navigation

- [ ] **Device Testing**
  - [ ] Desktop: Chrome, Firefox, Safari
  - [ ] Mobile: Galaxy A11, iPhone 12, Pixel
  - [ ] Tablet: iPad
  - [ ] Low-end: Emulator with 2GB RAM

- [ ] **Feature Testing**
  - [ ] All quick actions work
  - [ ] Pagination loads more jobs
  - [ ] Device detection disables 3D on low-end
  - [ ] Offline banner shows when offline

- [ ] **Security Testing**
  - [ ] No hardcoded credentials in code
  - [ ] Rate limiting blocks excessive requests
  - [ ] Geofencing requires real GPS
  - [ ] Workers can't approve own applications

---

## 📋 DAILY STANDUP TEMPLATE

Use this each day to track progress:

```
Date: ___________

Completed Yesterday:
- [ ] Task 1
- [ ] Task 2

Working on Today:
- [ ] Task 1
- [ ] Task 2

Blockers/Issues:
- Issue 1: ...
- Issue 2: ...

Next Steps:
- [ ] Task 1
- [ ] Task 2

Time Estimate: ___ hours
```

---

## 📞 NEED HELP?

### Documentation References

**For Device Detection**:
- See: `MOBILE_PERFORMANCE_QUICK_WINS_COMPLETED.md` (section #1)

**For Pagination**:
- See: `MOBILE_PERFORMANCE_QUICK_WINS_COMPLETED.md` (section #5)

**For Memory Leaks**:
- See: `PRODUCTION_10_10_FIXES.md` (issue #4)

**For Quick Actions**:
- See: `QUICK_ACTIONS_ENHANCED_FEATURES.md` (complete design guide)

**For Rate Limiting**:
- See: `PRODUCTION_10_10_FIXES.md` (issue #7)

**For Full Sprint Plan**:
- See: `PROJECT_NEXT_SPRINT_ROADMAP.md` (4-phase plan)

---

## ⏱️ TIME ESTIMATES

### Immediate (Today)
| Task | Time | Priority |
|------|------|----------|
| Wrap 3D components | 20 min | 🔴 HIGH |
| Test on device | 30 min | 🔴 HIGH |
| Build & verify | 10 min | 🔴 HIGH |
| **SUBTOTAL** | **1 hour** | |

### This Week
| Task | Time | Priority |
|------|------|----------|
| Fix memory leaks | 2 hours | 🔴 HIGH |
| Add rate limiting | 2 hours | 🔴 HIGH |
| Pagination UI | 1.5 hours | 🟠 MEDIUM |
| Performance testing | 1 hour | 🟠 MEDIUM |
| 3G testing | 30 min | 🟠 MEDIUM |
| **SUBTOTAL** | **7 hours** | |

### Next Week (Sprints 1-2)
| Task | Time | Priority |
|------|------|----------|
| Quick Actions framework | 3.5 hours | 🟠 MEDIUM |
| Security fixes | 2.5 hours | 🟠 MEDIUM |
| Feature implementation | 6 hours | 🟡 LOW |
| Test expansion | 8+ hours | 🟡 LOW |
| **SUBTOTAL** | **20 hours** | |

**TOTAL**: ~28 hours to reach 9.8/10 quality

---

## 🚀 DEPLOYMENT CHECKLIST

### Before Staging
- [ ] All tests pass
- [ ] No console errors
- [ ] Build succeeds
- [ ] Performance verified
- [ ] Security review done

### Before Production
- [ ] Staging test results good
- [ ] Performance metrics favorable
- [ ] No critical bugs found
- [ ] Team approval received
- [ ] Deployment guide followed

### After Production
- [ ] Monitor Firebase metrics
- [ ] Check crash rates
- [ ] Monitor battery drain
- [ ] Gather user feedback
- [ ] Prepare next sprint

---

## ✨ Success Criteria

**Today (Quick Wins)**
- ✅ 50% faster on low-end devices
- ✅ 0 OOM crashes
- ✅ 2-3x navigation speed
- ✅ Build succeeds
- ✅ No errors

**This Week (Security)**
- ✅ All 3D leaks fixed
- ✅ Rate limiting active
- ✅ No spam paths
- ✅ 70% tests passing

**Next Week (Features)**
- ✅ 12+ quick actions working
- ✅ Gamification active
- ✅ User engagement +40%
- ✅ Score 9.8/10

---

## 📌 PIN THESE LINKS

**Most Important Docs**:
1. 📍 `TODAY_SESSION_SUMMARY.md` - What was done today
2. 📍 `PROJECT_NEXT_SPRINT_ROADMAP.md` - What to do next
3. 📍 `MOBILE_PERFORMANCE_QUICK_WINS_COMPLETED.md` - Implementation details
4. 📍 `ACTIONABLE_TODO_LIST.md` - This file (daily reference)

**Status Docs**:
5. 📍 `CURRENT_PROJECT_STATUS_JUNE_5_2026.md` - Project status
6. 📍 `PRODUCTION_10_10_FIXES.md` - Remaining fixes

---

**Last Updated**: June 5, 2026  
**Status**: ✅ Ready for immediate action  
**Confidence**: HIGH - All tasks clearly scoped and estimated  

Start with the "TODAY/TOMORROW" section and work through each priority level.

**Let's go! 🚀**

