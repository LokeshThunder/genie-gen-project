# Hardcoded Strings Replacement Guide

**Status**: Ready for Phase 3 Implementation  
**Scope**: 8 critical screens with hardcoded error messages  
**Impact**: <10 minutes per screen to replace

---

## 🎯 Priority Replacements

### 1. AttendanceScreen (10 instances)

**File**: `src/screens/AttendanceScreen.jsx`

```javascript
// Line ~230: Inside handleCheckout function
// BEFORE:
if (!proofPhoto) {
  setLoading(false);
  setErrorMsg('Please capture a proof selfie first.');
  HapticService.warningPulse();
  return;
}

// AFTER:
if (!proofPhoto) {
  setLoading(false);
  setErrorMsg(t.error_no_proof_photo || 'Please capture a proof selfie first.');
  HapticService.warningPulse();
  return;
}

// ─────────────────────────────────────────────────────────

// Line ~240: GPS check
// BEFORE:
if (!navigator.geolocation) {
  setLoading(false);
  setErrorMsg('GPS location check is not supported by your device.');
  setCheckingOut(false);
  HapticService.error();
  return;
}

// AFTER:
if (!navigator.geolocation) {
  setLoading(false);
  setErrorMsg(t.error_gps_not_supported || 'GPS location check is not supported by your device.');
  setCheckingOut(false);
  HapticService.error();
  return;
}

// ─────────────────────────────────────────────────────────

// Line ~300: Geofence violation
// BEFORE:
if (distance > 200 && !isE2E) {
  setCheckoutError(`Geofence violation: You are ${Math.round(distance)}m away from the job site. Must be within 200m to checkout.`);
  setCheckingOut(false);
  HapticService.error();
  return;
}

// AFTER:
if (distance > 200 && !isE2E) {
  const msg = (t.error_geofence_violation || 'Geofence violation: You are {distance}m away from site. Must be within 200m.')
    .replace('{distance}', Math.round(distance));
  setCheckoutError(msg);
  setCheckingOut(false);
  HapticService.error();
  return;
}

// ─────────────────────────────────────────────────────────

// Line ~316: Liveness check failed
// BEFORE:
if (lScore < 20) {
  setVerificationStatus(null);
  setLoading(false);
  setErrorMsg('Liveness check failed. Please look at the camera.');
  HapticService.error();
  return;
}

// AFTER:
if (lScore < 20) {
  setVerificationStatus(null);
  setLoading(false);
  setErrorMsg(t.error_liveness_check_failed || 'Liveness check failed. Please look at the camera.');
  HapticService.error();
  return;
}

// ─────────────────────────────────────────────────────────

// Line ~328: Too dark
// BEFORE:
if (qResult.tooDark) {
  setVerificationStatus(null);
  setLoading(false);
  setErrorMsg('Selfie too dark. Find better lighting.');
  HapticService.error();
  return;
}

// AFTER:
if (qResult.tooDark) {
  setVerificationStatus(null);
  setLoading(false);
  setErrorMsg(t.error_selfie_too_dark || 'Selfie too dark. Find better lighting.');
  HapticService.error();
  return;
}

// ─────────────────────────────────────────────────────────

// Line ~333: Too bright
// BEFORE:
if (qResult.tooBright) {
  setVerificationStatus(null);
  setLoading(false);
  setErrorMsg('Selfie overexposed. Avoid direct glare.');
  HapticService.error();
  return;
}

// AFTER:
if (qResult.tooBright) {
  setVerificationStatus(null);
  setLoading(false);
  setErrorMsg(t.error_selfie_overexposed || 'Selfie overexposed. Avoid direct glare.');
  HapticService.error();
  return;
}

// ─────────────────────────────────────────────────────────

// Line ~370+: Sync failed
// BEFORE:
setErrorMsg(result.error);
HapticService.error();
// ... later
setErrorMsg('Sync failed. Please retry.');
HapticService.error();

// AFTER:
setErrorMsg(result.error || (t.error_sync_failed || 'Sync failed. Please retry.'));
HapticService.error();
```

---

### 2. TasksScreen (8 instances)

**File**: `src/screens/TasksScreen.jsx`

```javascript
// Line ~154: No proof photo
// BEFORE:
if (!proofPhoto) {
  setCheckoutError('Please capture your checkout proof photo.');
  return;
}

// AFTER:
if (!proofPhoto) {
  setCheckoutError(t.error_no_proof_photo || 'Please capture your checkout proof photo.');
  return;
}

// ─────────────────────────────────────────────────────────

// Line ~163: GPS not supported
// BEFORE:
if (!navigator.geolocation) {
  setCheckoutError('GPS location check is not supported by your device.');
  setCheckingOut(false);
  HapticService.error();
  return;
}

// AFTER:
if (!navigator.geolocation) {
  setCheckoutError(t.error_gps_not_supported || 'GPS location check is not supported by your device.');
  setCheckingOut(false);
  HapticService.error();
  return;
}

// ─────────────────────────────────────────────────────────

// Line ~188: Geofence violation
// BEFORE:
setCheckoutError(`Geofence violation: You are ${Math.round(distance)}m away from the job site. Must be within 200m to checkout.`);

// AFTER:
const msg = (t.error_geofence_violation || 'Geofence violation: You are {distance}m away from site. Must be within 200m.')
  .replace('{distance}', Math.round(distance));
setCheckoutError(msg);

// ─────────────────────────────────────────────────────────

// Line ~208: Checkout failed
// BEFORE:
setCheckoutError(result.error || 'Checkout registration failed.');

// AFTER:
setCheckoutError(result.error || (t.error_checkout_failed || 'Checkout registration failed.'));

// ─────────────────────────────────────────────────────────

// Line ~235: GPS required for verification
// BEFORE:
setCheckoutError('GPS location is required to verify your checkout site.');

// AFTER:
setCheckoutError(t.error_gps_required || 'GPS location is required to verify your checkout site.');

// ─────────────────────────────────────────────────────────

// Line ~208: Sync failed
// BEFORE:
setCheckoutError('Sync failed. Please retry.');

// AFTER:
setCheckoutError(t.error_sync_failed || 'Sync failed. Please retry.');
```

---

### 3. CreateJobScreen (5 instances)

**File**: `src/screens/CreateJobScreen.jsx`

```javascript
// Line ~119: Magic create error
// BEFORE:
setError("Failed to parse prompt. Try typing normal terms.");

// AFTER:
setError(t.magic_create_help || "Failed to parse prompt. Try typing normal terms.");

// ─────────────────────────────────────────────────────────

// Line ~448: Post failed (in handleCreate)
// BEFORE:
setError("Failed to post job. Check your connection.");

// AFTER:
setError(t.error_sync_failed || "Failed to post job. Check your connection.");

// ─────────────────────────────────────────────────────────

// Line ~533: Placeholder text (already has t.placeholder_title, keep as is)
// This one is FINE - uses t.placeholder_title || "e.g. Warehouse Loader"

// ─────────────────────────────────────────────────────────

// Line ~708: Job suggestions (these are AI suggestions, mostly OK but check)
// Consider: Should suggestions be translatable? Probably not critical,
// but add translation keys if needed:
// "job_suggestion_loader": "Warehouse Loader",
// "job_suggestion_packer": "Logistics Packer",
// etc.
```

---

### 4. WorkerApplicationsScreen (4 instances)

**File**: `src/screens/WorkerApplicationsScreen.jsx`

```javascript
// Line ~106: Failed to update status
// BEFORE:
setError('Failed to update status. Please try again.');

// AFTER:
setError(t.error_failed_update_status || 'Failed to update status. Please try again.');

// ─────────────────────────────────────────────────────────

// Line ~315: Cancel button (in dispute form)
// BEFORE:
<button onClick={() => setDisputeId(null)} className="cred-pill-action" ...>
  <span className="cred-pill-action-label" style={{ fontSize: 12 }}>Cancel</span>
</button>

// AFTER:
<button onClick={() => setDisputeId(null)} className="cred-pill-action" ...>
  <span className="cred-pill-action-label" style={{ fontSize: 12 }}>
    {t.cancel || 'Cancel'}
  </span>
</button>

// ─────────────────────────────────────────────────────────

// Line ~317: Submit Report button (mostly uses t.report, check if hardcoded)
// BEFORE:
<button ... className="cred-btn-black" ...>Submit Report</button>

// AFTER:
<button ... className="cred-btn-black" ...>
  {t.action_submit_report || 'Submit Report'}
</button>

// ─────────────────────────────────────────────────────────

// Line ~169: "WORKER PROFILE" title (in expanded details)
// This appears to use unit_dossier key - verify it's being used
// If not, add: {t.unit_dossier || 'WORKER PROFILE'}
```

---

### 5. AdminDashboard (6 instances)

**File**: `src/screens/AdminDashboard.jsx`

```javascript
// Line ~164-165: Upcoming Payroll
// BEFORE:
<div style={{ marginBottom: 8 }}>
  <div style={{ fontSize: 10, ... }}>Upcoming Payroll</div>
  <div style={{ fontSize: 20, ... }}>₹45,000</div>
</div>

// AFTER:
<div style={{ marginBottom: 8 }}>
  <div style={{ fontSize: 10, ... }}>{t.upcoming_payroll || 'Upcoming Payroll'}</div>
  <div style={{ fontSize: 20, ... }}>₹45,000</div>
</div>

// ─────────────────────────────────────────────────────────

// Line ~257-265: Excel export headers
// BEFORE:
const headers = ['JOB GENIE — WORKER PROFILE REPORT', ...];

// AFTER:
const headers = [
  t.excel_export_header || 'JOB GENIE — WORKER PROFILE REPORT',
  ...
];

// ─────────────────────────────────────────────────────────

// Line ~410: Notification message
// These are mostly dynamic and come from data, so check if any are hardcoded
// If so, use t.upcoming_payroll_desc || 'Total scheduled for this week'
```

---

### 6. AdminJobsScreen (2 instances)

**File**: `src/screens/AdminJobsScreen.jsx`

```javascript
// Line ~93: Empty state title
// BEFORE:
<div style={{ textAlign: 'center', marginTop: 60 }}>
  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
    Empty Inventory
  </div>

// AFTER:
<div style={{ textAlign: 'center', marginTop: 60 }}>
  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
    {t.empty_inventory || 'Empty Inventory'}
  </div>

// ─────────────────────────────────────────────────────────

// Line ~95: Empty state message
// BEFORE:
<div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
  No jobs found in this section. Put up a new post to hire workers.
</div>

// AFTER:
<div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
  {t.empty_inventory_message || 'No jobs found in this section. Put up a new post to hire workers.'}
</div>
```

---

### 7. TrackingScreen (2 instances)

**File**: `src/screens/TrackingScreen.jsx`

```javascript
// Line ~176: Dynamic surge display
// BEFORE:
<div>${surgeLocations.length} surge locations</div>

// AFTER:
<div>
  {(t.three_surge_locations || '{count} surge locations')
    .replace('{count}', surgeLocations.length)}
</div>

// ─────────────────────────────────────────────────────────

// Line ~318: Awaiting activity (mostly uses fallback, check if OK)
// Current: uses t.awaiting_pulse || 'AWAITING OPERATIONAL PULSE...'
// Acceptable - keep as is
```

---

### 8. ReportsScreen (2 instances)

**File**: `src/screens/ReportsScreen.jsx`

```javascript
// Line ~128: Screen title description
// BEFORE:
<div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
  Real-time Deployment Monitoring
</div>

// AFTER:
<div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
  {t.monitor_realtime || 'Real-time Deployment Monitoring'}
</div>

// ─────────────────────────────────────────────────────────

// Line ~155+: Empty metrics display
// These mostly use fallbacks already, verify in code
```

---

## 📊 Summary Table

| Screen | Instances | Priority | Time Est. |
|--------|-----------|----------|-----------|
| AttendanceScreen | 10 | 🔴 HIGH | 10 min |
| TasksScreen | 8 | 🔴 HIGH | 8 min |
| CreateJobScreen | 5 | 🟡 MED | 5 min |
| WorkerApplicationsScreen | 4 | 🟡 MED | 4 min |
| AdminDashboard | 6 | 🟡 MED | 6 min |
| AdminJobsScreen | 2 | 🟢 LOW | 2 min |
| TrackingScreen | 2 | 🟢 LOW | 2 min |
| ReportsScreen | 2 | 🟢 LOW | 2 min |

**Total Estimated Time**: ~40 minutes for complete replacement

---

## ✅ Implementation Checklist

- [ ] AttendanceScreen: Replace 10 hardcoded strings
- [ ] TasksScreen: Replace 8 hardcoded strings
- [ ] CreateJobScreen: Replace 5 hardcoded strings
- [ ] WorkerApplicationsScreen: Replace 4 hardcoded strings
- [ ] AdminDashboard: Replace 6 hardcoded strings
- [ ] AdminJobsScreen: Replace 2 hardcoded strings
- [ ] TrackingScreen: Replace 2 hardcoded strings
- [ ] ReportsScreen: Replace 2 hardcoded strings
- [ ] Test each screen in different languages
- [ ] Verify error messages appear in selected language
- [ ] Commit changes with message: "feat: Replace 39 hardcoded strings with translation keys"

---

**Ready for Phase 3 Implementation**  
**Date**: June 3, 2026  
**Maintained By**: Kiro AI Development Environment

