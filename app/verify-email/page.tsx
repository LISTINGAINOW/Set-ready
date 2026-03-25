'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCsrfToken } from '@/lib/client-security';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

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
        router.push('/locations');
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
      <div className="min-h-screen bg-black px-4 py-16 text-white">
        <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-[#111111] p-10 shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">Email sent</p>
          <h1 className="mt-4 text-3xl font-bold">Check your inbox</h1>
          <p className="mt-4 text-base text-zinc-400">
            We sent a verification link to{' '}
            {email ? (
              <span className="font-medium text-white">{email}</span>
            ) : (
              'your email address'
            )}
            . Click the link to activate your account.
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            Didn&apos;t receive it? Check your spam folder or{' '}
            <Link href="/register" className="text-blue-400 hover:underline">
              register again
            </Link>
            .
          </p>
          <div className="mt-8">
            <Link href="/login" className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Token present — show verification in progress / result
  return (
    <div className="min-h-screen bg-black px-4 py-16 text-white">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-[#111111] p-10 shadow-2xl">
        {status === 'verifying' && (
          <>
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">Verifying</p>
            </div>
            <h1 className="mt-4 text-3xl font-bold">Confirming your email&hellip;</h1>
            <p className="mt-4 text-base text-zinc-400">Please wait while we verify your account.</p>
          </>
        )}

        {status === 'verified' && (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">Success</p>
            <h1 className="mt-4 text-3xl font-bold">Email verified</h1>
            <p className="mt-4 text-base text-zinc-400">Your account is active. Redirecting you now&hellip;</p>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Error</p>
            <h1 className="mt-4 text-3xl font-bold">Verification failed</h1>
            <p className="mt-4 text-base text-zinc-400">{errorMessage || 'The link may be invalid or already used.'}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-700">
                Register again
              </Link>
              <Link href="/login" className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5">
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
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading&hellip;</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
