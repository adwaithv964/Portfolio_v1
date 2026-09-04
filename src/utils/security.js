/**
 * security.js — Centralized Security Utilities
 * Adwaith V Portfolio
 *
 * Covers: Input sanitization, email validation, rate limiting,
 * honeypot validation, bot detection, and devtools deterrent.
 */

// ─────────────────────────────────────────────
// 1. INPUT SANITIZATION
// Strips all HTML tags and dangerous script patterns
// from user-supplied strings to prevent XSS injection.
// ─────────────────────────────────────────────
export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';

  return str
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove javascript: protocol attempts
    .replace(/javascript\s*:/gi, '')
    // Remove event handler attributes (onclick, onerror, etc.)
    .replace(/on\w+\s*=/gi, '')
    // Remove data: URIs
    .replace(/data\s*:/gi, '')
    // Remove vbscript: protocol
    .replace(/vbscript\s*:/gi, '')
    // Collapse excessive whitespace
    .replace(/\s{3,}/g, '  ')
    .trim();
}

// ─────────────────────────────────────────────
// 2. EMAIL VALIDATION
// Strict RFC-5322 compliant regex check.
// Browser type="email" is weak — this enforces proper format.
// ─────────────────────────────────────────────
export function validateEmail(email) {
  // Must match: local@domain.tld (no consecutive dots, valid chars only)
  const RFC_EMAIL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+\-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
  return RFC_EMAIL_REGEX.test(email.trim());
}

// ─────────────────────────────────────────────
// 3. LENGTH VALIDATORS
// Enforces maximum field lengths to prevent
// oversized payload attacks and database bloat.
// ─────────────────────────────────────────────
export const FIELD_LIMITS = {
  firstName: 50,
  lastName:  50,
  email:    254, // RFC 5321 max email length
  message: 2000,
};

export function isWithinLimit(value, field) {
  const limit = FIELD_LIMITS[field];
  return typeof value === 'string' && value.length <= limit;
}

// ─────────────────────────────────────────────
// 4. RATE LIMITER (localStorage-based)
// Prevents form spam by enforcing a cooldown period
// between submissions. Uses a namespaced localStorage key.
// ─────────────────────────────────────────────
const RATE_LIMIT_KEY = 'av_contact_last_submit';
const RATE_LIMIT_MS  = 60_000; // 60 seconds cooldown

export function isRateLimited() {
  try {
    const last = localStorage.getItem(RATE_LIMIT_KEY);
    if (!last) return false;
    return Date.now() - parseInt(last, 10) < RATE_LIMIT_MS;
  } catch {
    // If localStorage is blocked (private mode), allow submission
    return false;
  }
}

export function setRateLimitTimestamp() {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
  } catch {
    // Silently fail — do not block the user
  }
}

export function getRateLimitSecondsLeft() {
  try {
    const last = localStorage.getItem(RATE_LIMIT_KEY);
    if (!last) return 0;
    const elapsed = Date.now() - parseInt(last, 10);
    return Math.max(0, Math.ceil((RATE_LIMIT_MS - elapsed) / 1000));
  } catch {
    return 0;
  }
}

// ─────────────────────────────────────────────
// 5. HONEYPOT VALIDATOR
// Bots auto-fill ALL form fields, including hidden ones.
// If the honeypot field has any value, it's a bot.
// ─────────────────────────────────────────────
export function isHoneypotTriggered(honeypotValue) {
  return typeof honeypotValue === 'string' && honeypotValue.length > 0;
}

// ─────────────────────────────────────────────
// 6. BOT TIMING CHECK
// Legitimate users take > 3 seconds to fill a form.
// Bots submit instantly. Reject if form was submitted
// less than 3 seconds after it was first rendered.
// ─────────────────────────────────────────────
export function createFormTimestamp() {
  return Date.now();
}

export function isSubmittedTooFast(formLoadedAt, minMs = 3000) {
  return Date.now() - formLoadedAt < minMs;
}

// ─────────────────────────────────────────────
// 7. DEVTOOLS DETERRENT
// Injects a styled warning in the browser console
// to deter casual script kiddies and social engineers.
// NOT a security control — a psychological deterrent.
// ─────────────────────────────────────────────
export function injectDevToolsWarning() {
  const style = [
    'color: #E50914',
    'background: #0a0a0a',
    'font-size: 16px',
    'font-weight: bold',
    'padding: 8px 16px',
    'border-left: 4px solid #E50914',
  ].join(';');

  const infoStyle = [
    'color: #ffffff',
    'background: #141414',
    'font-size: 12px',
    'padding: 4px 12px',
  ].join(';');

  console.log('%c⚠ STOP — SECURITY NOTICE', style);
  console.log(
    '%cThis is a personal portfolio protected against unauthorized access and tampering.\nIf someone instructed you to paste anything here, this is a social engineering attack.\nUnauthorized inspection or modification of this application is prohibited.',
    infoStyle
  );
  console.log('%c— Adwaith V | Full-Stack Developer & Cyber Security Analyst', infoStyle);
}

// ─────────────────────────────────────────────
// 8. FULL FORM VALIDATION PIPELINE
// Runs all checks in order. Returns { valid, error }.
// ─────────────────────────────────────────────
export function validateContactForm({ firstName, lastName, email, message, honeypot, formLoadedAt, permission }) {

  // Bot check 1: honeypot field filled
  if (isHoneypotTriggered(honeypot)) {
    return { valid: false, error: null }; // Silently reject bots
  }

  // Bot check 2: submitted too fast
  if (isSubmittedTooFast(formLoadedAt)) {
    return { valid: false, error: null }; // Silently reject bots
  }

  // Rate limit check
  if (isRateLimited()) {
    const secs = getRateLimitSecondsLeft();
    return { valid: false, error: `Please wait ${secs}s before sending another message.` };
  }

  // Permission checkbox
  if (!permission) {
    return { valid: false, error: 'Please accept the contact permission to proceed.' };
  }

  // Required field checks
  if (!firstName.trim()) return { valid: false, error: 'First name is required.' };
  if (!lastName.trim())  return { valid: false, error: 'Last name is required.' };
  if (!email.trim())     return { valid: false, error: 'Email address is required.' };
  if (!message.trim())   return { valid: false, error: 'Message cannot be empty.' };

  // Length limit checks
  if (!isWithinLimit(firstName, 'firstName')) return { valid: false, error: `First name must be under ${FIELD_LIMITS.firstName} characters.` };
  if (!isWithinLimit(lastName,  'lastName'))  return { valid: false, error: `Last name must be under ${FIELD_LIMITS.lastName} characters.` };
  if (!isWithinLimit(email,     'email'))     return { valid: false, error: `Email address is too long.` };
  if (!isWithinLimit(message,   'message'))   return { valid: false, error: `Message must be under ${FIELD_LIMITS.message} characters.` };

  // Email format validation
  if (!validateEmail(email)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  return { valid: true, error: null };
}
