# 🎨 Accessible Components Guide

Quick reference for using the new accessible components in Job Genie.

---

## 1. AccessibleModal

**Purpose**: Wrapper for any modal to add keyboard handling and focus management.

**Location**: `src/components/AccessibleModal.jsx`

### Features
- ✅ Focus trap (Tab cycles within modal)
- ✅ Escape key closes modal
- ✅ Automatic focus restoration
- ✅ ARIA attributes (role="dialog", aria-modal="true")
- ✅ Body scroll prevention

### Usage

```jsx
import AccessibleModal from './AccessibleModal';

function MyModal({ isOpen, onClose }) {
  return (
    <div style={{position: 'fixed', inset: 0, ...}}>
      <AccessibleModal 
        isOpen={isOpen} 
        onClose={onClose} 
        titleId="my-modal-title"
        className="my-modal-class"
      >
        <h2 id="my-modal-title">Modal Title</h2>
        <p>Modal content here</p>
        <button onClick={onClose}>Close</button>
      </AccessibleModal>
    </div>
  );
}
```

### Props
- `isOpen` (bool): Show/hide modal
- `onClose` (fn): Close handler
- `titleId` (string): ID of the h1/h2 title element
- `className` (string): Optional CSS class
- `role` (string): Default "dialog", can be "alertdialog"

### Keyboard Behavior
- **Tab**: Cycle to next focusable element (loops at end)
- **Shift+Tab**: Cycle to previous element (loops at start)
- **Escape**: Close modal

---

## 2. LoadingButton

**Purpose**: Button with built-in loading state and accessibility.

**Location**: `src/components/LoadingButton.jsx`

### Features
- ✅ Loading state UI (spinner + text)
- ✅ aria-busy flag
- ✅ Disabled while loading
- ✅ Framer Motion animations

### Usage

```jsx
import { LoadingButton } from './LoadingButton';
import { useState } from 'react';

function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Your async work here
      await loginUser();
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadingButton
      loading={loading}
      onClick={handleSubmit}
      loadingText="Signing in..."
      variant="primary"
    >
      Sign In
    </LoadingButton>
  );
}
```

### Props
- `loading` (bool): Show loading state
- `disabled` (bool): Disable button
- `children` (node): Button text
- `loadingText` (string): Text shown while loading
- `variant` (string): "primary" | "gold" | "outline" | "ghost" | "danger"
- All standard button props

---

## 3. InputError

**Purpose**: Accessible error message for form inputs.

**Location**: `src/components/InputError.jsx`

### Features
- ✅ role="alert" for screen readers
- ✅ Smooth animation
- ✅ aria-live="polite" (announced immediately)
- ✅ Styled with consistent colors

### Usage

```jsx
import { InputError } from './InputError';
import { useState } from 'react';

function EmailInput() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleBlur = () => {
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
    }
  };

  return (
    <div>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={handleBlur}
        aria-invalid={error.length > 0}
        aria-describedby={error ? 'email-error' : undefined}
      />
      <InputError 
        id="email-error"
        show={error.length > 0} 
        message={error}
      />
    </div>
  );
}
```

### Props
- `show` (bool): Display the error
- `message` (string): Error text
- `id` (string): HTML ID for aria-describedby linking

---

## 4. EmptyState

**Purpose**: Accessible empty state for list screens.

**Location**: `src/components/EmptyState.jsx`

### Features
- ✅ role="status" for screen readers
- ✅ Large icon + title + subtitle
- ✅ Optional action button
- ✅ Smooth entrance animation

### Usage

```jsx
import { EmptyState } from './EmptyState';

function JobsList({ jobs, isLoading }) {
  if (isLoading) return <LoadingScreen />;

  if (!jobs || jobs.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="No jobs available"
        subtitle="Check back later or adjust your search filters"
        actionLabel="Browse all jobs"
        onAction={() => setFilters({})}
      />
    );
  }

  return (
    <div>
      {jobs.map(job => <JobCard key={job.id} job={job} />)}
    </div>
  );
}
```

### Props
- `icon` (string): Emoji or text icon
- `title` (string): Main message
- `subtitle` (string): Supporting text
- `actionLabel` (string): Optional button text
- `onAction` (fn): Optional button click handler
- `className` (string): CSS class

---

## 5. Enhanced NavBar (Keyboard Navigation)

**Location**: `src/components/NavBar.jsx`

### Keyboard Shortcuts
- **Arrow Right**: Next tab
- **Arrow Left**: Previous tab
- **Home**: First tab
- **End**: Last tab
- **Tab/Shift+Tab**: Standard tabbing through buttons

### ARIA Features
- `aria-label`: Descriptive name for each tab
- `aria-current="page"`: Marks active tab for screen readers

### Example Output
```html
<nav aria-label="Primary navigation">
  <button aria-label="Home" aria-current="page">HOME</button>
  <button aria-label="Find Job" aria-current="false">MISSION</button>
  <!-- ... -->
</nav>
```

---

## 6. Enhanced Modals (TutorialModal, RatingModal, QRScannerModal)

All modals now use `AccessibleModal` wrapper with:

### Keyboard Support
- **Tab/Shift+Tab**: Navigate within modal
- **Escape**: Close modal

### ARIA Features
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` pointing to title
- `aria-label` on all buttons
- `role="alert"` on errors
- `aria-live="polite"` on status updates

---

## 🎯 Common Patterns

### Pattern 1: Form with Validation

```jsx
import { LoadingButton } from './LoadingButton';
import { InputError } from './InputError';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!email.includes('@')) {
      setEmailError('Invalid email');
      return;
    }
    
    setLoading(true);
    try {
      await signup(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={emailError.length > 0}
        aria-describedby={emailError ? 'email-error' : undefined}
      />
      <InputError 
        id="email-error"
        show={emailError.length > 0}
        message={emailError}
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <LoadingButton loading={loading} type="submit">
        Sign Up
      </LoadingButton>
    </form>
  );
}
```

### Pattern 2: List with Empty State

```jsx
import { EmptyState } from './EmptyState';

function ApplicationsList({ applications, status }) {
  if (status === 'loading') return <LoadingScreen />;

  if (!applications || applications.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No applications yet"
        subtitle="Start applying to jobs to track your progress here"
        actionLabel="Browse available jobs"
        onAction={() => navigate('Find Job')}
      />
    );
  }

  return (
    <div>
      {applications.map(app => (
        <ApplicationCard key={app.id} app={app} />
      ))}
    </div>
  );
}
```

### Pattern 3: Accessible Modal

```jsx
import AccessibleModal from './AccessibleModal';
import { useState } from 'react';

function ConfirmationModal({ isOpen, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{position: 'fixed', inset: 0, ...}}>
      <AccessibleModal 
        isOpen={isOpen} 
        onClose={onClose}
        titleId="confirm-title"
      >
        <h2 id="confirm-title">Confirm Action</h2>
        <p>Are you sure you want to proceed?</p>
        
        <div style={{display: 'flex', gap: 10, marginTop: 20}}>
          <button onClick={onClose}>Cancel</button>
          <LoadingButton 
            loading={loading}
            onClick={handleConfirm}
            variant="danger"
          >
            Confirm
          </LoadingButton>
        </div>
      </AccessibleModal>
    </div>
  );
}
```

---

## ✅ Checklist for Accessible Components

When building new screens or components:

- [ ] Form fields have `<label>` or `aria-label`
- [ ] Input errors use `InputError` component
- [ ] Empty states use `EmptyState` component
- [ ] Async buttons use `LoadingButton`
- [ ] Modals wrap content with `AccessibleModal`
- [ ] Icon-only buttons have `aria-label`
- [ ] Important announcements have `role="alert"` + `aria-live`
- [ ] Active state marked with `aria-current`
- [ ] Color not sole indicator (add icons, text, etc.)
- [ ] Touch targets ≥ 44x44px

---

## 🧪 Testing

### Manual Keyboard Testing
1. **Tab through page** - All interactive elements reachable
2. **Arrow keys in NavBar** - Switches tabs smoothly
3. **Tab in modals** - Cycles only within modal
4. **Escape in modals** - Closes modal
5. **Focus visible** - Clear outline on focused elements

### Screen Reader Testing (Free Tools)
- **Windows**: NVDA (free), Narrator (built-in)
- **Mac**: VoiceOver (built-in)
- **Mobile**: TalkBack (Android), VoiceOver (iOS)

### Automated Testing
```bash
# Install axe DevTools Chrome extension
# Or use pa11y CLI:
npm install -g pa11y-ci
pa11y-ci http://localhost:5173
```

---

## 📚 Resources

- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Framer Motion Accessibility](https://www.framer.com/motion/animation-controls/#accessibility)

---

**Last Updated**: June 3, 2026  
**Maintained By**: Kiro AI Development Environment
