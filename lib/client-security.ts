export function getCsrfToken() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|; )csrf-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export function sanitizeInput(value: string) {
  return value
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trimStart();
}

export function sanitizeEmail(value: string) {
  return sanitizeInput(value).toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizeEmail(email));
}

export function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
}

export function isStrongPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}
