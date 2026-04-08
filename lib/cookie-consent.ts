export type CookieConsentPreferences = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

export type CookieConsentState = {
  version: 1;
  consentGiven: boolean;
  preferences: CookieConsentPreferences;
  updatedAt: string;
};

export const COOKIE_CONSENT_NAME = 'setvenue_cookie_consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

export const defaultCookieConsentPreferences = (): CookieConsentPreferences => ({
  essential: true,
  analytics: false,
  marketing: false,
});

export function buildCookieConsentState(
  preferences: Partial<Omit<CookieConsentPreferences, 'essential'>> = {}
): CookieConsentState {
  return {
    version: 1,
    consentGiven: true,
    preferences: {
      essential: true,
      analytics: preferences.analytics ?? false,
      marketing: preferences.marketing ?? false,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function parseCookieConsent(value?: string | null): CookieConsentState | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<CookieConsentState>;
    if (!parsed || typeof parsed !== 'object' || !parsed.preferences) {
      return null;
    }

    return {
      version: 1,
      consentGiven: parsed.consentGiven === true,
      preferences: {
        essential: true,
        analytics: parsed.preferences.analytics === true,
        marketing: parsed.preferences.marketing === true,
      },
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function readCookieConsent(cookieSource?: string): CookieConsentState | null {
  const source = cookieSource ?? (typeof document !== 'undefined' ? document.cookie : '');
  if (!source) return null;

  const escapedName = COOKIE_CONSENT_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`(?:^|; )${escapedName}=([^;]+)`));

  return parseCookieConsent(match?.[1] ?? null);
}

export function writeCookieConsent(state: CookieConsentState) {
  if (typeof document === 'undefined') return;

  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = [
    `${COOKIE_CONSENT_NAME}=${encodeURIComponent(JSON.stringify(state))}`,
    'Path=/',
    `Max-Age=${COOKIE_MAX_AGE}`,
    'SameSite=Lax',
    secure,
  ].join('; ');
}

export function hasAnalyticsConsent(state: CookieConsentState | null) {
  return state?.consentGiven === true && state.preferences.analytics === true;
}
