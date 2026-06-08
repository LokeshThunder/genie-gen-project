/**
 * AccessibleModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A wrapper component that makes modals accessible:
 * - Focus trap (Tab cycles within modal)
 * - Escape key closes modal
 * - Proper ARIA attributes (role="dialog", aria-modal="true", aria-labelledby)
 * - Manages focus restoration on close
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef } from 'react';

export const AccessibleModal = ({
  isOpen = false,
  onClose,
  children,
  titleId = 'modal-title',
  className = '',
  role = 'dialog',
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Get all focusable elements within modal
  const getFocusableElements = () => {
    if (!modalRef.current) return [];
    return Array.from(
      modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled'));
  };

  // Focus trap: intercept Tab key and cycle focus within modal
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusables = getFocusableElements();
    if (focusables.length === 0) return;

    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];
    const activeEl = document.activeElement;

    if (e.shiftKey) {
      // Shift+Tab: if on first, go to last
      if (activeEl === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab: if on last, go to first
      if (activeEl === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    // Save current focus
    previousActiveElement.current = document.activeElement;

    // Focus first focusable element in modal
    const focusables = getFocusableElements();
    if (focusables.length > 0) {
      focusables[0].focus();
    }

    // Create bound handler for proper cleanup
    const boundKeydownHandler = (e) => handleKeyDown(e);
    
    // Add keyboard listener
    document.addEventListener('keydown', boundKeydownHandler);

    // Prevent body scroll when modal is open
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollY}px`;

    return () => {
      // Remove keyboard listener with bound handler
      document.removeEventListener('keydown', boundKeydownHandler);

      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, scrollY);

      // Restore focus to previous element (if it still exists)
      if (previousActiveElement.current && 'focus' in previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role={role}
      aria-modal="true"
      aria-labelledby={titleId}
      className={`accessible-modal ${className}`}
      ref={modalRef}
    >
      {children}
    </div>
  );
};

export default AccessibleModal;
