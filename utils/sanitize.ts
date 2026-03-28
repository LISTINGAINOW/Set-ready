/**
 * Shared sanitization utilities for use across all form inputs, API routes,
 * and client-side validation. Prevents XSS, strips HTML tags, validates formats.
 *
 * Server-side: import from utils/sanitize (wraps lib/security)
 * Client-side: import from utils/sanitize (wraps lib/client-security)
 */

// --- String sanitization ---

/** Strip HTML tags and control characters, collapse whitespace. */
export function sanitizeInput(value: string): string {
  return value
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[<>]/g, '') // strip remaining angle brackets
    .replace(/[\u0000-\u001F\u007F]/g, ' ') // control chars → space
    .replace(/\s+/g, ' ')
    .trim();
}

/** Sanitize an email address: strip HTML, lowercase, trim. */
export function sanitizeEmail(value: string): string {
  return sanitizeInput(value).toLowerCase();
}

/**
 * Sanitize a phone number — keep only digits, +, -, (, ), spaces.
 * Strips everything else.
 */
export function sanitizePhone(value: string): string {
  return value.replace(/[^\d+\-().\\s ]/g, '').trim();
}

/** Recursively sanitize all string values in a plain object. */
export function sanitizeObject<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (typeof value === 'string') return [key, sanitizeInput(value)];
      if (Array.isArray(value))
        return [key, value.map((item) => (typeof item === 'string' ? sanitizeInput(item) : item))];
      if (value && typeof value === 'object')
        return [key, sanitizeObject(value as Record<string, unknown>)];
      return [key, value];
    })
  ) as T;
}

// --- Validation ---

/** Returns true if the email passes basic RFC-style validation. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizeEmail(email));
}

/** Returns true if phone contains at least 7 digits. */
export function isValidPhone(phone: string): boolean {
  return sanitizePhone(phone).replace(/\D/g, '').length >= 7;
}

/** Returns true if password meets strength requirements. */
export function isStrongPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

// --- Client-side token helper (no-op on server) ---

/** Read the CSRF token from the browser cookie. Returns '' on server. */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|; )csrf-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}
