'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';

interface MessageButtonProps {
  propertyId: string;
  propertyName: string;
  /** The host's user ID. Required to initiate a conversation. */
  hostId?: string;
  className?: string;
  variant?: 'default' | 'outline';
}

export default function MessageButton({
  propertyId,
  propertyName,
  hostId,
  className = '',
  variant = 'default',
}: MessageButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const baseClass =
    variant === 'outline'
      ? 'inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:border-blue-600 hover:text-blue-600'
      : 'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700';

  async function handleSend() {
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          propertyId,
          propertyName,
          hostId: hostId || 'host',
          initialMessage: message.trim(),
        }),
      });

      if (res.status === 401) {
        // Not logged in — redirect to login
        router.push(`/login?redirect=/messages`);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send message. Please try again.');
        return;
      }

      setSuccess(true);
      setMessage('');

      // Navigate to the conversation after a brief delay
      setTimeout(() => {
        router.push(`/messages/${data.conversationId}`);
      }, 800);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${baseClass} ${className}`}
        aria-label="Message the host"
      >
        <MessageSquare className="h-4 w-4" />
        Message Host
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Send a message to the host"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-black">Message Host</h2>
                <p className="mt-0.5 text-sm text-black/60 line-clamp-1">{propertyName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-black/40 transition hover:bg-black/5 hover:text-black"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <div className="rounded-2xl bg-green-50 p-4 text-center">
                <p className="text-sm font-semibold text-green-700">Message sent! Redirecting to your inbox…</p>
              </div>
            ) : (
              <>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi, I'm interested in booking ${propertyName} for a shoot. Could you tell me more about availability?`}
                  className="w-full resize-none rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-black outline-none transition focus:border-blue-600 focus:bg-white"
                  disabled={isSubmitting}
                  autoFocus
                />

                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium text-black transition hover:border-black/30"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isSubmitting || !message.trim()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isSubmitting ? 'Sending…' : 'Send Message'}
                  </button>
                </div>

                <p className="mt-3 text-center text-xs text-black/40">
                  You must be signed in to message a host.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
