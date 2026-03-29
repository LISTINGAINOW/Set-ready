'use client';

import { useState } from 'react';
import { MessageCircle, CheckCircle } from 'lucide-react';
import { getCsrfToken, isValidEmail, sanitizeInput, sanitizeEmail } from '@/lib/client-security';

interface QuickQuestionProps {
  propertyId: string;
  propertyName: string;
}

export default function QuickQuestion({ propertyId, propertyName }: QuickQuestionProps) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Please enter your name.'); return; }
    if (!form.email.trim() || !isValidEmail(form.email)) { setError('Please enter a valid email address.'); return; }
    if (!form.message.trim()) { setError('Please enter a message.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/messages/quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken(),
        },
        body: JSON.stringify({
          propertyId,
          propertyName,
          name: sanitizeInput(form.name),
          email: sanitizeEmail(form.email),
          message: sanitizeInput(form.message),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-slate-900">Message sent!</h3>
        <p className="text-sm text-slate-600">
          Thanks for reaching out! We&apos;ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-blue-50 p-2.5">
          <MessageCircle className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Have a Question?</h3>
          <p className="text-sm text-slate-500">We&apos;ll respond within 24 hours.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Name <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              required
              maxLength={120}
              placeholder="Jane Smith"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email <span className="text-blue-600">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              required
              maxLength={200}
              placeholder="jane@studio.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Message <span className="text-blue-600">*</span>
          </label>
          <textarea
            value={form.message}
            onChange={set('message')}
            required
            rows={3}
            maxLength={1000}
            placeholder="Ask about availability, access, crew logistics, or anything else..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
