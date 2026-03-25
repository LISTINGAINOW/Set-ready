'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { getCsrfToken, isStrongPassword, isValidEmail, sanitizeEmail, sanitizeInput } from '@/lib/client-security';

function LoginContent() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';
  const timeoutReason = searchParams.get('reason') === 'timeout';

  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  const [verificationLink, setVerificationLink] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordChecklist = useMemo(
    () => [
      { label: 'At least 8 characters', valid: formData.password.length >= 8 },
      { label: 'Uppercase letter', valid: /[A-Z]/.test(formData.password) },
      { label: 'Lowercase letter', valid: /[a-z]/.test(formData.password) },
      { label: 'Number', valid: /\d/.test(formData.password) },
    ],
    [formData.password]
  );

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

    if (!isStrongPassword(formData.password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
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
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold text-white sm:mt-6">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm leading-6 text-blue-500">
            Or <Link href="/register" className="font-medium text-blue-400 hover:text-blue-300">create a new account</Link>
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-black/80 p-5 sm:p-8">
          {timeoutReason && (
            <div className="mb-4 rounded-lg border border-amber-600 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
              You were signed out after inactivity. Sign in again to continue.
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-700 bg-red-900/30 px-4 py-3 text-sm text-red-300">
                <p>{error}</p>
                {verificationLink && (
                  <Link href={verificationLink} className="mt-3 inline-block font-semibold text-blue-400 hover:text-blue-300">
                    Open verification page
                  </Link>
                )}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="mt-1 block min-h-[48px] w-full appearance-none rounded-lg border border-blue-200 bg-black px-3 py-3 text-white placeholder-blue-300 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm" placeholder="you@example.com" value={formData.email} onChange={handleChange} disabled={loading} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-1 block min-h-[48px] w-full appearance-none rounded-lg border border-blue-200 bg-black px-3 py-3 text-white placeholder-blue-300 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm" placeholder="••••••••" value={formData.password} onChange={handleChange} disabled={loading} />
              <div className="mt-3 rounded-lg border border-blue-900/60 bg-blue-950/20 p-3 text-xs text-blue-200">
                <p className="font-semibold text-blue-300">Password requirements</p>
                <ul className="mt-2 space-y-1">
                  {passwordChecklist.map((item) => (
                    <li key={item.label} className={item.valid ? 'text-emerald-300' : 'text-blue-200/80'}>
                      {item.valid ? '✓' : '•'} {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-h-[44px] items-center">
                <input id="remember-me" name="rememberMe" type="checkbox" className="h-4 w-4 rounded border-blue-200 bg-black text-blue-600 focus:ring-blue-500" checked={formData.rememberMe} onChange={handleChange} disabled={loading} />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-500">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-400 hover:text-blue-300">Forgot your password?</a>
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="group relative flex min-h-[48px] w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
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
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-black text-white">Loading login…</div>}>
      <LoginContent />
    </Suspense>
  );
}
