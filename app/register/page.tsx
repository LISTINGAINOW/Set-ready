'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { getCsrfToken, getPasswordStrength, isStrongPassword, isValidEmail, sanitizeEmail, sanitizeInput } from '@/lib/client-security';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
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
    setSuccess('');
    setLoading(true);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!isStrongPassword(formData.password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
      setLoading(false);
      return;
    }

    if (!formData.terms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken(),
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('ds-last-activity', String(Date.now()));
      setSuccess(data.message || 'Verification email sent. Please check your inbox.');
      toast({ title: 'Account created', description: 'Your verification step is ready. Redirecting now.', variant: 'success' });

      window.setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold text-slate-950 sm:mt-6">Create your account</h2>
          <p className="mt-2 text-center text-sm leading-6 text-blue-500">
            Already have an account? <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)] p-5 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {success && (
              <div className="rounded-lg border border-green-700 bg-green-900/30 px-4 py-3 text-sm text-green-200">
                <p>{success}</p>
                <p className="mt-2 text-green-100/80">Redirecting you to the verification page now…</p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">First name</label>
                <input id="firstName" name="firstName" type="text" autoComplete="given-name" required className="mt-1 block min-h-[48px] w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-slate-950 placeholder-slate-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm" placeholder="John" value={formData.firstName} onChange={handleChange} disabled={loading} />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Last name</label>
                <input id="lastName" name="lastName" type="text" autoComplete="family-name" required className="mt-1 block min-h-[48px] w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-slate-950 placeholder-slate-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm" placeholder="Doe" value={formData.lastName} onChange={handleChange} disabled={loading} />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="mt-1 block min-h-[48px] w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-slate-950 placeholder-slate-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm" placeholder="you@example.com" value={formData.email} onChange={handleChange} disabled={loading} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required className="mt-1 block min-h-[48px] w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-slate-950 placeholder-slate-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm" placeholder="••••••••" value={formData.password} onChange={handleChange} disabled={loading} />
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-700">Password strength</p>
                  <span className="font-semibold text-slate-950">{passwordStrength.label}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full ${passwordStrength.color}`} style={{ width: `${Math.max(10, (passwordStrength.score / 5) * 100)}%` }} />
                </div>
                <ul className="mt-3 space-y-1">
                  {passwordChecklist.map((item) => (
                    <li key={item.label} className={item.valid ? 'text-emerald-600' : 'text-slate-500'}>
                      {item.valid ? '✓' : '•'} {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className="mt-1 block min-h-[48px] w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-slate-950 placeholder-slate-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} disabled={loading} />
            </div>
            <div className="flex items-start">
              <input id="terms" name="terms" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500" required checked={formData.terms} onChange={handleChange} disabled={loading} />
              <label htmlFor="terms" className="ml-2 block text-sm leading-6 text-blue-500">
                I agree to the <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
              </label>
            </div>
            <div>
              <button type="submit" disabled={loading} className="group relative flex min-h-[48px] w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
