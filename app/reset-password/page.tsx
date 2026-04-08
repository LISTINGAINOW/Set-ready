'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { getCsrfToken, getPasswordStrength, isStrongPassword, isValidEmail, sanitizeEmail } from '@/lib/client-security';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const token = searchParams?.get('token') || searchParams?.get('reset') || '';

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email) {
      setError('Email is required.');
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken(),
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to send reset email.');
      }

      setSuccess(data.message || 'If an account exists for that email, we’ve sent password reset instructions.');
      toast({ title: 'Check your email', description: 'If an account exists, a reset link is on the way.', variant: 'success' });
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!token) {
      setError('Missing reset token. Request a new password reset email.');
      setLoading(false);
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Enter and confirm your new password.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken(),
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to reset password.');
      }

      setSuccess(data.message || 'Your password has been reset successfully.');
      toast({ title: 'Password updated', description: 'You can sign in with your new password now.', variant: 'success' });
      window.setTimeout(() => {
        router.push('/login?reset=success');
      }, 1200);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div>
          <h1 className="mt-2 text-center text-3xl font-bold text-slate-950 sm:mt-6">
            {token ? 'Create a new password' : 'Forgot your password?'}
          </h1>
          <p className="mt-2 text-center text-sm leading-6 text-slate-500">
            {token ? 'Choose a new password for your SetVenue account.' : 'Enter your email and we’ll send you a secure reset link.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-8">
          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

          {!token ? (
            <form className="space-y-5" onSubmit={handleForgotPassword}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(sanitizeEmail(event.target.value))}
                  disabled={loading}
                />
              </div>
              <button type="submit" disabled={loading} className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Sending reset link...' : 'Send reset link'}
              </button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                This reset link expires in 1 hour. If it no longer works, request a new one.
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">New password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 block min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={loading}
                />
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-700">Password strength</p>
                    <span className="font-semibold text-slate-950">{passwordStrength.label}</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                    <div className={`h-full ${passwordStrength.color}`} style={{ width: `${Math.max(10, (passwordStrength.score / 5) * 100)}%` }} />
                  </div>
                  <p className="mt-3">Use at least 8 characters, including uppercase, lowercase, and a number.</p>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm new password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 block min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={loading}
                />
              </div>
              <button type="submit" disabled={loading} className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Updating password...' : 'Reset password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-500">
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Back to login
            </Link>
            {!token && (
              <>
                {' '}
                or{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  create an account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white text-slate-950">Loading password reset…</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
