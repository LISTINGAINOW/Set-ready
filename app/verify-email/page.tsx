'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCsrfToken } from '@/lib/client-security';

const DEFAULT_DASHBOARD_REDIRECT = '/dashboard/owner';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams?.get('email') || '';
  const token = searchParams?.get('token') || '';

  const [status, setStatus] = useState<'verifying' | 'verified' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': getCsrfToken(),
          },
          body: JSON.stringify({ email, token }),
        });
        const data = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        setStatus('verified');
        window.setTimeout(() => {
          router.push(DEFAULT_DASHBOARD_REDIRECT);
        }, 2500);
      } catch (error: unknown) {
        if (cancelled) return;
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email, token, router]);

  // No token — show check your inbox state
  if (!token) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] px-4 py-16 text-black">
        <div className="mx-auto max-w-lg rounded-3xl border border-black/10 bg-white p-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Email sent</p>
          <h1 className="mt-4 text-3xl font-bold">Check your inbox</h1>
          <p className="mt-4 text-base text-black/70">
            We sent a verification link to{' '}
            {email ? (
              <span className="font-medium text-black">{email}</span>
            ) : (
              'your email address'
            )}
            . Click the link to activate your account.
          </p>
          <p className="mt-4 text-sm text-black/60">
            Didn&apos;t receive it? Check your spam folder or{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              register again
            </Link>
            .
          </p>
          <div className="mt-8">
            <Link href="/login" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-black px-5 py-3 text-sm font-semibold text-black transition hover:border-blue-600 hover:text-blue-600">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Token present — show verification in progress / result
  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-16 text-black">
      <div className="mx-auto max-w-lg rounded-3xl border border-black/10 bg-white p-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        {status === 'verifying' && (
          <>
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Verifying</p>
            </div>
            <h1 className="mt-4 text-3xl font-bold">Confirming your email&hellip;</h1>
            <p className="mt-4 text-base text-black/70">Please wait while we verify your account.</p>
          </>
        )}

        {status === 'verified' && (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Success</p>
            <h1 className="mt-4 text-3xl font-bold">Verification complete</h1>
            <p className="mt-4 text-base text-black/70">Your email has been confirmed and your account is now active.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={DEFAULT_DASHBOARD_REDIRECT} className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                Open dashboard
              </Link>
              <Link href="/locations" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-black px-5 py-3 text-sm font-semibold text-black transition hover:border-blue-600 hover:text-blue-600">
                Browse locations
              </Link>
            </div>
            <p className="mt-4 text-sm text-black/60">Redirecting automatically in a moment&hellip;</p>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Error</p>
            <h1 className="mt-4 text-3xl font-bold">Verification failed</h1>
            <p className="mt-4 text-base text-black/70">{errorMessage || 'The link may be invalid or already used.'}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                Register again
              </Link>
              <Link href="/login" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-black px-5 py-3 text-sm font-semibold text-black transition hover:border-blue-600 hover:text-blue-600">
                Go to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f8fb] text-black/70 flex items-center justify-center">Loading&hellip;</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
