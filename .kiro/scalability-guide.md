# Scalability & Backend Optimization Guide

## 🎯 Current Limitations

1. **No pagination** — All jobs/applications loaded at once (O(n) memory)
2. **No Cloud Functions** — All business logic on client (untrusted)
3. **No Firestore indexes** — Complex queries may timeout
4. **No search** — Only in-memory filtering available
5. **No caching** — Repeated queries hit Firestore repeatedly

## ✅ Recommended Improvements

### Phase 1: Firestore Optimization (1–2 days)

#### 1.1 Add Firestore Indexes

Create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "jobs",
      "queryScope": "Collection",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "jobs",
      "queryScope": "Collection",
      "fields": [
        { "fieldPath": "createdAt", "order": "DESCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "applications",
      "queryScope": "Collection",
      "fields": [
        { "fieldPath": "workerId", "order": "ASCENDING" },
        { "fieldPath": "appliedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy:
```bash
firebase deploy --only firestore:indexes
```

**Expected Impact**: Query latency reduced by 50–70%

#### 1.2 Implement Cursor-Based Pagination

**Current** (bad): Fetch all jobs at once
```js
const snapshot = await getDocs(query(collection(db, 'jobs')));
setJobs(snapshot.docs.map(d => d.data()));
```

**Improved**: Paginate by cursor
```js
export async function getJobsPage(pageSize = 20, cursor = null) {
  let q = query(
    collection(db, 'jobs'),
    where('status', '==', 'Live'),
    orderBy('createdAt', 'desc'),
    limit(pageSize + 1) // Fetch extra to check if more exist
  );
  
  if (cursor) {
    q = query(q, startAfter(cursor));
  }
  
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.slice(0, pageSize);
  const hasMore = snapshot.docs.length > pageSize;
  const nextCursor = hasMore ? snapshot.docs[pageSize - 1] : null;
  
  return {
    jobs: docs.map(d => ({ id: d.id, ...d.data() })),
    nextCursor,
    hasMore,
  };
}
```

Usage in FindGigScreen:
```jsx
const [jobs, setJobs] = useState([]);
const [cursor, setCursor] = useState(null);
const [loading, setLoading] = useState(false);

const loadMore = async () => {
  setLoading(true);
  const { jobs: newJobs, nextCursor } = await getJobsPage(20, cursor);
  setJobs(prev => [...prev, ...newJobs]);
  setCursor(nextCursor);
  setLoading(false);
};
```

**Expected Impact**: Reduce time-to-interactive by 60%, memory usage by 80%

### Phase 2: Cloud Functions (2–3 days)

#### 2.1 Deploy Critical Business Logic to Cloud Functions

**Why**: Ensure data integrity, rate limiting, security validations

**Function 1: Application Approval Workflow**

```js
// functions/approveApplication.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();

exports.approveApplication = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User not logged in');
  
  const { applicationId, decision } = data;
  const userId = context.auth.uid;
  
  // Verify user is admin
  const userDoc = await db.collection('users').doc(userId).get();
  if (userDoc.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized');
  }
  
  const appDoc = await db.collection('applications').doc(applicationId).get();
  if (!appDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Application not found');
  }
  
  const app = appDoc.data();
  const newStatus = decision === 'approve' ? 'Approved' : 'Rejected';
  
  // Update application atomically
  await db.collection('applications').doc(applicationId).update({
    status: newStatus,
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  // Award XP if approved
  if (decision === 'approve') {
    await db.collection('users').doc(app.workerId).update({
      xp: admin.firestore.FieldValue.increment(50),
    });
  }
  
  // Send notification
  await admin.messaging().sendToTopic(`worker-${app.workerId}`, {
    title: 'Application ' + newStatus,
    body: `Your application for ${app.jobTitle} was ${newStatus.toLowerCase()}.`,
  });
  
  return { success: true, status: newStatus };
});
```

Client-side usage:
```js
import { httpsCallable } from 'firebase/functions';

const approveApplication = httpsCallable(functions, 'approveApplication');
const result = await approveApplication({ applicationId, decision: 'approve' });
```

**Function 2: Award XP (with Trust Gates)**

```js
// functions/awardXP.js
exports.awardXP = functions.https.onCall(async (data, context) => {
  const { userId, amount, type } = data;
  
  // Validate trust gate
  const userDoc = await db.collection('users').doc(userId).get();
  const trustScore = userDoc.data()?.trustScore || 0;
  
  if (trustScore < 60 && type === 'premium') {
    throw new functions.https.HttpsError('failed-precondition', 'Trust too low');
  }
  
  // Atomic increment
  await db.collection('users').doc(userId).update({
    xp: admin.firestore.FieldValue.increment(amount),
  });
  
  return { newXP: userDoc.data().xp + amount };
});
```

#### 2.2 Deploy Rate Limiting

```js
// functions/rateLimit.js
const rateLimit = require('firebase-admin/app-check');

exports.createJobApplication = functions
  .runWith({ enforceAppCheck: true })
  .https.onCall(async (data, context) => {
    // Only 3 applications per minute per user
    const userId = context.auth.uid;
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentApps = await db.collection('applications')
      .where('workerId', '==', userId)
      .where('appliedAt', '>', oneMinuteAgo)
      .count()
      .get();
    
    if (recentApps.data().count >= 3) {
      throw new functions.https.HttpsError('resource-exhausted', 'Rate limited: 3 apps per minute');
    }
    
    // Create application
    // ...
  });
```

### Phase 3: Search & Filtering (1–2 days)

#### 3.1 Implement Full-Text Search with Algolia

```bash
npm install algoliasearch
```

Setup Algolia sync via Cloud Function:

```js
// functions/syncJobsToAlgolia.js
const algoliasearch = require('algoliasearch');
const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
const index = client.initIndex('jobs');

exports.syncJobToAlgolia = functions.firestore
  .document('jobs/{jobId}')
  .onWrite(async (change, context) => {
    const jobId = context.params.jobId;
    const jobData = change.after.data();
    
    if (!change.after.exists) {
      // Document deleted
      await index.deleteObject(jobId);
    } else {
      // Document created/updated
      await index.saveObject({
        objectID: jobId,
        ...jobData,
      });
    }
  });
```

Client-side search:

```jsx
import algoliasearch from 'algoliasearch';

const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY
);
const index = searchClient.initIndex('jobs');

const results = await index.search('warehousing', {
  filters: 'category:Warehousing AND status:Live',
  hitsPerPage: 20,
});
```

### Phase 4: Real-Time Notifications (1 day)

Add Firebase Cloud Messaging (FCM):

```js
// functions/sendJobNotification.js
exports.notifyNewJob = functions.firestore
  .document('jobs/{jobId}')
  .onCreate(async (snap, context) => {
    const job = snap.data();
    
    // Find interested workers based on skill match
    const workers = await db.collection('users')
      .where('skills', 'array-contains', job.requirementsTags[0])
      .limit(100)
      .get();
    
    // Send notifications
    const registrationTokens = workers.docs
      .map(doc => doc.data().fcmToken)
      .filter(Boolean);
    
    if (registrationTokens.length > 0) {
      await admin.messaging().sendMulticast({
        notification: {
          title: `New ${job.category} job!`,
          body: `${job.title} — ₹${job.wage}/day`,
        },
        webpush: {
          fcmOptions: { link: '/find-gig' },
        },
        tokens: registrationTokens,
      });
    }
  });
```

## 📊 Expected Performance Gains

| Optimization | Current | Optimized | Gain |
|---|---|---|---|
| **Initial Load** | 1.5s | <1s | 33% faster |
| **Memory** | 50MB+ (all jobs) | 5MB (single page) | 90% less |
| **Query Time** | 2–5s | <500ms | 80% faster |
| **Concurrent Users** | ~100 | ~1000+ | 10x better |

## 🚀 Deployment Checklist

- [ ] Create Firestore indexes
- [ ] Add Cloud Functions project
- [ ] Deploy initial Cloud Functions
- [ ] Set up environment variables in Firebase
- [ ] Test functions locally with emulator
- [ ] Set up CI/CD for functions deployment
- [ ] Monitor function logs & errors
- [ ] Implement search (Algolia or Firebase Extensions)
- [ ] Add real-time notifications (FCM)
- [ ] Load test with 1000+ concurrent users

## 🔧 Monitoring & Scaling

### Track Cloud Function Performance

```js
// Use Firebase Extensions for monitoring
firebase ext:install firebaseextensions.io/firestore-counter
firebase ext:install firebaseextensions.io/send-grid-email
```

### Enable Firestore Auto-Scaling

```bash
firebase deploy --only firestore:rules
# Monitor billing dashboard for read/write costs
```

### Set Up Alerts

```bash
# In Firebase Console:
# Project Settings → Billing → Budgets & Alerts
# Set alerts for:
#  - Firestore reads > $100/month
#  - Firestore writes > $50/month
#  - Cloud Functions > 1M invocations
```

## 📚 Resources

- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Cloud Functions Pricing](https://firebase.google.com/pricing)
- [Algolia Documentation](https://www.algolia.com/doc/)
- [Firebase Realtime Messaging](https://firebase.google.com/docs/cloud-messaging)
