'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (json.ok) {
        router.push('/admin');
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-700 text-white text-lg font-bold shadow-lg">
            SV
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="mt-1.5 text-sm text-slate-500">SetVenue management portal</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-xl bg-green-700 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Signing in\u2026' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
