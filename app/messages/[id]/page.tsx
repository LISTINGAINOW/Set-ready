'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Send, Loader2, LockKeyhole } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface Conversation {
  id: string;
  property_id: string;
  property_name: string;
  host_id: string;
  guest_id: string;
  created_at: string;
  updated_at: string;
}

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const [conversationId, setConversationId] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    params.then(({ id }) => setConversationId(id));
  }, [params]);

  const loadThread = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}/messages`, { credentials: 'include' });
      if (res.status === 401) { setAuthError(true); return; }
      if (res.status === 403 || res.status === 404) { setNotFound(true); return; }
      if (!res.ok) { setError('Failed to load conversation.'); return; }
      const data = await res.json();
      setConversation(data.conversation);
      setMessages(data.messages || []);
      setCurrentUserId(data.currentUserId || '');
    } catch {
      setError('Network error. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (conversationId) loadThread(conversationId);
  }, [conversationId, loadThread]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!reply.trim() || !conversationId) return;
    setSending(true);
    setSendError('');
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body: reply.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSendError(data.error || 'Failed to send message.');
        return;
      }
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setReply('');
      textareaRef.current?.focus();
    } catch {
      setSendError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  if (authError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
          <LockKeyhole className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-black">Sign in to view this conversation</h1>
        <p className="mt-2 text-sm text-black/60">This message thread is private.</p>
        <Link
          href={`/login?redirect=/messages/${conversationId}`}
          className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-black">Conversation not found</h1>
        <p className="mt-2 text-sm text-black/60">This thread doesn&apos;t exist or you don&apos;t have access.</p>
        <Link href="/messages" className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
          Back to Inbox
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="mb-6">
        <Link href="/messages" className="inline-flex min-h-[44px] items-center gap-2 text-sm text-black/60 hover:text-black sm:text-base">
          <ArrowLeft className="h-4 w-4" />
          Back to messages
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && conversation && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_340px] lg:items-start">
          {/* Thread */}
          <section className="overflow-hidden rounded-3xl border border-black bg-white shadow-sm">
            <div className="border-b border-black/10 px-5 py-5 sm:px-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Conversation</p>
              <h1 className="mt-2 text-2xl font-bold text-black sm:text-3xl">
                {conversation.property_name || `Property ${conversation.property_id}`}
              </h1>
            </div>

            {/* Messages */}
            <div className="space-y-4 bg-black/[0.02] px-4 py-5 sm:px-6 sm:py-6" style={{ minHeight: '300px' }}>
              {messages.length === 0 && (
                <p className="text-center text-sm text-black/40">No messages yet.</p>
              )}
              {messages.map((msg) => {
                const isOwn = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isOwn
                          ? 'rounded-br-sm bg-blue-600 text-white'
                          : 'rounded-bl-sm border border-black/10 bg-white text-black'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.body}</p>
                      <p
                        className={`mt-1.5 text-xs ${
                          isOwn ? 'text-white/70' : 'text-black/40'
                        }`}
                      >
                        {formatTimestamp(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply box */}
            <div className="border-t border-black/10 bg-white px-4 py-4 sm:px-6 sm:py-5">
              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-3 sm:p-4">
                <label htmlFor="reply" className="mb-2 block text-sm font-medium text-black">
                  Reply
                </label>
                <textarea
                  id="reply"
                  ref={textareaRef}
                  rows={4}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a reply… (Cmd+Enter to send)"
                  className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-blue-600 sm:text-base"
                  disabled={sending}
                />
                {sendError && (
                  <p className="mt-2 text-sm text-red-600">{sendError}</p>
                )}
                <div className="mt-3 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || !reply.trim()}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {sending ? 'Sending…' : 'Send reply'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-4 sm:space-y-5">
            <div className="rounded-3xl border border-black bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Property context</p>
              <h2 className="mt-3 text-xl font-bold text-black">
                {conversation.property_name || `Property ${conversation.property_id}`}
              </h2>
              <div className="mt-4 flex items-start gap-3 text-sm text-black/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>Exact address shared after confirmed booking</span>
              </div>
              <Link
                href={`/locations/${conversation.property_id}`}
                className="mt-5 flex min-h-[44px] items-center justify-center rounded-xl border border-black/10 px-4 text-sm font-semibold text-black transition hover:border-blue-600 hover:text-blue-600"
              >
                View Property
              </Link>
            </div>

            <div className="rounded-3xl border border-black bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Thread info</p>
              <dl className="mt-4 space-y-3 text-sm text-black/70">
                <div className="flex justify-between gap-3">
                  <dt>Started</dt>
                  <dd className="text-right font-medium text-black">{formatTimestamp(conversation.created_at)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Messages</dt>
                  <dd className="font-medium text-black">{messages.length}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
