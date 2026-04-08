'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { getCsrfToken, isValidEmail, sanitizeEmail, sanitizeInput } from '@/lib/client-security';

function LoginContent() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/dashboard';
  const timeoutReason = searchParams?.get('reason') === 'timeout';
  const resetSuccess = searchParams?.get('reset') === 'success';
  const resetToken = searchParams?.get('reset');
  const hasResetToken = Boolean(resetToken && resetToken !== 'success');

  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  const [verificationLink, setVerificationLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : name === 'email' ? sanitizeEmail(value) : sanitizeInput(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerificationLink('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken(),
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresVerification) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setVerificationLink(data.verificationLink || '');
        }
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('ds-last-activity', String(Date.now()));
      toast({ title: 'Signed in', description: 'Welcome back. Taking you to your dashboard now.', variant: 'success' });
      router.push(redirectTarget);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold text-slate-950 sm:mt-6">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm leading-6 text-slate-500">
            Or <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">create a new account</Link>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-8">
          {timeoutReason && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              You were signed out after inactivity. Sign in again to continue.
            </div>
          )}
          {resetSuccess && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Your password was reset successfully. Sign in with your new password.
            </div>
          )}
          {hasResetToken && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              You opened a password reset link.{' '}
              <Link href={`/reset-password?token=${encodeURIComponent(resetToken || '')}`} className="font-semibold text-blue-700 underline underline-offset-2">
                Continue resetting your password
              </Link>
              .
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p>{error}</p>
                {verificationLink && (
                  <Link href={verificationLink} className="mt-3 inline-block font-semibold text-blue-600 hover:text-blue-500">
                    Open verification page
                  </Link>
                )}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="mt-1 block min-h-[48px] w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 placeholder-slate-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="you@example.com" value={formData.email} onChange={handleChange} disabled={loading} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-1 block min-h-[48px] w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 placeholder-slate-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="••••••••" value={formData.password} onChange={handleChange} disabled={loading} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-h-[44px] items-center">
                <input id="remember-me" name="rememberMe" type="checkbox" className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500" checked={formData.rememberMe} onChange={handleChange} disabled={loading} />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">Remember me</label>
              </div>
              <div className="text-sm">
                <Link href="/reset-password" className="inline-flex min-h-[44px] items-center font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="group relative flex min-h-[48px] w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white text-slate-950">Loading login…</div>}>
      <LoginContent />
    </Suspense>
  );
}
