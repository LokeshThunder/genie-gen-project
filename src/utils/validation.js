/**
 * Shared validation utilities for Job Genie forms.
 * Returns { valid: boolean, error: string | null }
 */

// ── Phone number ─────────────────────────────────────────────────────────────
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { valid: false, error: 'Phone number is required.' };
  }
  // Strip spaces, dashes, parentheses
  const digits = phone.replace(/[\s\-().+]/g, '');
  // Must be 10 digits (India) or 10-15 digits with country code
  if (!/^\d{10,15}$/.test(digits)) {
    return { valid: false, error: 'Enter a valid phone number (10–15 digits).' };
  }
  // Indian numbers: must start with 6, 7, 8, or 9
  if (digits.length === 10 && !/^[6-9]/.test(digits)) {
    return { valid: false, error: 'Indian mobile numbers start with 6, 7, 8, or 9.' };
  }
  return { valid: true, error: null };
};

// ── OTP ──────────────────────────────────────────────────────────────────────
export const validateOtp = (otp) => {
  if (!otp || !otp.trim()) {
    return { valid: false, error: 'Please enter the OTP.' };
  }
  if (!/^\d{6}$/.test(otp.trim())) {
    return { valid: false, error: 'OTP must be exactly 6 digits.' };
  }
  return { valid: true, error: null };
};

// ── Job creation form ─────────────────────────────────────────────────────────
export const validateJobForm = (formData, step) => {
  const errors = {};

  if (step === 1 || step === 'all') {
    if (!formData.title?.trim()) {
      errors.title = 'Job title is required.';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters.';
    }

    if (!formData.category) {
      errors.category = 'Please select a job category.';
    }

    if (!formData.locationName?.trim()) {
      errors.locationName = 'Location name is required.';
    }
  }

  if (step === 2 || step === 'all') {
    if (!formData.wage || isNaN(Number(formData.wage)) || Number(formData.wage) <= 0) {
      errors.wage = 'Enter a valid wage amount (e.g. 500).';
    } else if (Number(formData.wage) < 100) {
      errors.wage = 'Wage must be at least ₹100.';
    } else if (Number(formData.wage) > 100000) {
      errors.wage = 'Wage seems too high. Please verify.';
    }

    if (!formData.workerCount || isNaN(Number(formData.workerCount)) || Number(formData.workerCount) < 1) {
      errors.workerCount = 'At least 1 worker is required.';
    } else if (Number(formData.workerCount) > 500) {
      errors.workerCount = 'Maximum 500 workers per posting.';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required.';
    } else {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const start = new Date(formData.startDate);
      if (start < today) {
        errors.startDate = 'Start date cannot be in the past.';
      }
    }

    if (!formData.startTime) errors.startTime = 'Start time is required.';
    if (!formData.endTime)   errors.endTime   = 'End time is required.';

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errors.endTime = 'End time must be after start time.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// ── Generic required field ────────────────────────────────────────────────────
export const required = (value, label = 'This field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${label} is required.`;
  }
  return null;
};
