# Accessibility Guidelines

This document outlines accessibility best practices for Job Genie to ensure the platform is usable by everyone, including people with disabilities.

## WCAG 2.1 Level AA Compliance Target

We aim for WCAG 2.1 Level AA compliance across all features.

## Key Areas

### 1. Keyboard Navigation

All interactive elements must be accessible via keyboard:

```jsx
// ✅ Good: Button is keyboard accessible
<button onClick={handleClick} aria-label="Apply for job">
  Apply Now
</button>

// ❌ Bad: Div without keyboard support
<div onClick={handleClick}>Apply Now</div>
```

**Checklist**:
- Tab order is logical and visible
- All buttons/links are reachable via Tab
- Enter/Space activates buttons
- Escape closes modals

### 2. ARIA Labels & Roles

Use ARIA attributes to describe interactive elements:

```jsx
// ✅ Good: Clear labels
<button aria-label="Close dialog" onClick={close}>×</button>
<div role="status" aria-live="polite" aria-atomic="true">
  {notification}
</div>

// ❌ Bad: No labels
<button onClick={close}>×</button>
<div>{notification}</div>
```

**Common ARIA**:
- `aria-label`: Describe button/link purpose
- `aria-live="polite"`: Announce dynamic content
- `aria-current="page"`: Mark current nav page
- `aria-disabled="true"`: Mark disabled state
- `aria-expanded="true/false"`: Mark expandable sections
- `role="status"`: Mark status messages
- `role="alert"`: Mark urgent alerts

### 3. Color Contrast

Text must have sufficient contrast ratio:

- **Normal text**: 4.5:1 (minimum WCAG AA)
- **Large text** (18pt+): 3:1 (minimum WCAG AA)
- **UI components** (borders, icons): 3:1

**Test**:
```bash
npm install -D axe-core
# Run axe DevTools browser extension
```

**Current Status**: White background with black text meets AA standards. Gold accents need verification.

### 4. Screen Readers

Support users with screen readers (NVDA, JAWS, VoiceOver):

```jsx
// ✅ Good: Semantic HTML + ARIA
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/jobs">Find Job</a></li>
  </ul>
</nav>

// ❌ Bad: Divs + no landmark roles
<div>
  <div><span>Home</span></div>
  <div><span>Find Job</span></div>
</div>
```

**Checklist**:
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- Don't hide text with CSS (`display: none` hides from screen readers)
- Use `aria-hidden="true"` for decorative elements only
- Describe images with `alt` text

### 5. Focus Indicators

Users must see where focus is:

```css
/* ✅ Good: Visible focus indicator */
button:focus {
  outline: 3px solid #C9A84C;
  outline-offset: 2px;
}

/* ❌ Bad: Removed focus */
button:focus {
  outline: none;
}
```

### 6. Motion & Animations

Respect users with vestibular disorders:

```jsx
// ✅ Good: Respect prefers-reduced-motion
const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
>
  Content
</motion.div>

// ❌ Bad: Always animate
<motion.div animate={{ opacity: 1 }} transition={{ duration: 1 }}>
```

### 7. Form Accessibility

```jsx
// ✅ Good: Labels associated with inputs
<label htmlFor="email">Email</label>
<input id="email" type="email" required aria-required="true" />

// ❌ Bad: Floating placeholder
<input placeholder="Email" type="email" />
```

**Checklist**:
- Every input has associated `<label>`
- Required fields marked with `aria-required="true"`
- Error messages associated with input (`aria-describedby`)
- Form validation errors announced to screen readers

### 8. Mobile Accessibility

- **Target size**: Buttons ≥ 48x48dp (mobile minimum)
- **Touch spacing**: 8dp between interactive elements
- **Font size**: Minimum 14px base font
- **Zoom**: Don't disable `user-scalable=no` in viewport

```html
<!-- ✅ Good: Allow zoom -->
<meta name="viewport" content="width=device-width, initial-scale=1" />

<!-- ❌ Bad: Disabled zoom -->
<meta name="viewport" content="width=device-width, user-scalable=no" />
```

### 9. Language & Clarity

- Use clear, simple language
- Explain abbreviations: "PIN (Personal Identification Number)"
- Avoid jargon where possible
- Keep sentences short

### 10. Testing Checklist

Before shipping features:

- [ ] Keyboard-only navigation works
- [ ] Screen reader testing (NVDA/JAWS/VoiceOver)
- [ ] Color contrast ≥ 4.5:1 (normal text)
- [ ] Focus indicators visible
- [ ] No motion animations for users with `prefers-reduced-motion`
- [ ] All images have descriptive `alt` text
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Mobile touch targets ≥ 48x48dp
- [ ] Axe DevTools scan passes (no errors/warnings)

## Testing Tools

```bash
# Automated testing
npm install -D @axe-core/react
npm install -D jest-axe

# Manual testing
# Browser extensions:
# - axe DevTools (Chrome, Firefox)
# - WAVE (Chrome, Firefox)
# - Lighthouse (Chrome DevTools built-in)

# Screen reader testing
# Windows: NVDA (free), JAWS (paid)
# macOS: VoiceOver (built-in)
# iOS: VoiceOver (built-in)
# Android: TalkBack (built-in)
```

## Component Template (Accessible)

```jsx
import React from 'react';

export function AccessibleButton({ onClick, children, ariaLabel, disabled }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      aria-disabled={disabled}
      className="btn"
    >
      {children}
    </button>
  );
}

export function AccessibleForm({ onSubmit }) {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email Address</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-required="true"
        aria-describedby={error ? 'email-error' : undefined}
      />
      {error && (
        <div id="email-error" role="alert" className="error">
          {error}
        </div>
      )}
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| No focus indicator | Add `:focus { outline: 3px solid #gold }` |
| Text too small | Use `font-size: 14px` minimum |
| Low contrast | Verify 4.5:1 ratio with axe DevTools |
| No alt text | Add descriptive `alt="..."` to images |
| Unmapped form input | Add `<label htmlFor="id">` |
| Distracting animations | Respect `prefers-reduced-motion` |
| Clickable div | Use `<button>` or add `role="button"` + keyboard handling |

## Resources

- [WCAG 2.1 Specification](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Accessible Rich Internet Applications (ARIA)](https://www.w3.org/WAI/ARIA/apg/)
- [axe DevTools Tutorial](https://www.deque.com/axe/devtools/)

## Ongoing

- [ ] Set up automated accessibility tests in CI/CD
- [ ] Conduct manual screen reader testing quarterly
- [ ] Gather feedback from users with disabilities
- [ ] Track accessibility issues in GitHub
