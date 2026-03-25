'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const WARNING_AFTER_MS = 25 * 60 * 1000;
const LOGOUT_AFTER_MS = 30 * 60 * 1000;
const STORAGE_KEY = 'ds-last-activity';

function clearClientSession() {
  localStorage.removeItem('user');
  document.cookie = 'ds-session=; Max-Age=0; path=/; SameSite=Strict';
}

export default function SessionSecurity() {
  const router = useRouter();
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(Math.ceil((LOGOUT_AFTER_MS - WARNING_AFTER_MS) / 1000));
  const intervalRef = useRef<number | null>(null);

  const isProtectedArea = useMemo(() => pathname?.startsWith('/dashboard') || pathname?.startsWith('/producer') || pathname?.startsWith('/list-property'), [pathname]);

  useEffect(() => {
    if (!isProtectedArea) return;

    const recordActivity = () => {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      if (showWarning) setShowWarning(false);
    };

    const checkSession = () => {
      const user = localStorage.getItem('user');
      if (!user) return;

      const lastActivity = Number(localStorage.getItem(STORAGE_KEY) || Date.now());
      const idleMs = Date.now() - lastActivity;

      if (idleMs >= LOGOUT_AFTER_MS) {
        clearClientSession();
        setShowWarning(false);
        router.push('/login?reason=timeout');
        return;
      }

      if (idleMs >= WARNING_AFTER_MS) {
        setShowWarning(true);
        setCountdown(Math.max(0, Math.ceil((LOGOUT_AFTER_MS - idleMs) / 1000)));
      }
    };

    recordActivity();
    const events: Array<keyof WindowEventMap> = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    events.forEach((eventName) => window.addEventListener(eventName, recordActivity, { passive: true }));
    intervalRef.current = window.setInterval(checkSession, 1000);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isProtectedArea, router, showWarning]);

  if (!showWarning || !isProtectedArea) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-sm rounded-2xl border border-amber-300 bg-black p-4 text-white shadow-2xl">
      <p className="text-sm font-semibold text-amber-300">Session timeout warning</p>
      <p className="mt-2 text-sm text-white/85">
        You&apos;ve been inactive. For security, you&apos;ll be signed out in about {countdown} seconds.
      </p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, String(Date.now()));
          setShowWarning(false);
        }}
        className="mt-3 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
      >
        Stay signed in
      </button>
    </div>
  );
}
