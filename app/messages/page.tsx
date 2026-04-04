'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Search, ChevronRight, Loader2, LockKeyhole } from 'lucide-react';

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
  updated_at: string;
  messages: Message[];
  unreadCount: number;
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/conversations', { credentials: 'include' });
        if (res.status === 401) {
          setAuthError(true);
          return;
        }
        if (!res.ok) {
          setError('Failed to load conversations. Please refresh.');
          return;
        }
        const data = await res.json();
        setConversations(data.conversations || []);
      } catch {
        setError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conv) => {
      const lastMsg = conv.messages[conv.messages.length - 1]?.body ?? '';
      return [conv.property_name, conv.property_id, lastMsg].join(' ').toLowerCase().includes(query);
    });
  }, [search, conversations]);

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (authError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
          <LockKeyhole className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-black">Sign in to view messages</h1>
        <p className="mt-2 text-sm text-black/60">Your inbox is private. Please sign in to continue.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/login?redirect=/messages"
            className="inline-flex items-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center rounded-xl border border-black/10 px-6 py-2.5 text-sm font-semibold text-black transition hover:border-blue-600"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Inbox</p>
          <h1 className="mt-2 text-3xl font-bold text-black sm:text-4xl">Messages</h1>
          <p className="mt-3 max-w-2xl text-sm text-black/60 sm:text-base">
            Keep hosts and guests aligned before the shoot. Search conversations and jump back into any thread.
          </p>
        </div>
        {!loading && !error && (
          <div className="rounded-2xl border border-blue-600/20 bg-blue-600/10 px-5 py-4 text-black">
            <p className="text-sm text-black/60">Unread messages</p>
            <p className="mt-1 text-3xl font-bold text-blue-600">{totalUnread}</p>
          </div>
        )}
      </div>

      <div className="mb-6 rounded-2xl border border-black bg-white p-3 shadow-sm sm:p-4">
        <label className="flex items-center gap-3 rounded-xl bg-black/[0.03] px-4 py-3">
          <Search className="h-5 w-5 text-black/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by property or message"
            className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/40 sm:text-base"
          />
        </label>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {filteredConversations.map((conv) => {
            const lastMessage = conv.messages[conv.messages.length - 1];
            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="block rounded-2xl border border-black bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-600/30 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-black">
                        {conv.property_name || `Property ${conv.property_id}`}
                      </h2>
                      {conv.unreadCount > 0 && (
                        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                          {conv.unreadCount} unread
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="mt-4 line-clamp-2 text-sm text-black/75 sm:text-base">
                        {lastMessage.body}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 lg:items-end">
                    <p className="text-sm text-black/50">{formatTimestamp(conv.updated_at)}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4 text-sm text-black/60">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{conv.messages.length} messages</span>
                  </div>
                  <span className="inline-flex items-center gap-2 font-medium text-blue-600">
                    Open conversation
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}

          {filteredConversations.length === 0 && conversations.length > 0 && (
            <div className="rounded-2xl border border-dashed border-black/20 bg-white/70 px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-black">No conversations match that search</h3>
              <p className="mt-2 text-sm text-black/60 sm:text-base">Try another property name or message snippet.</p>
            </div>
          )}

          {conversations.length === 0 && (
            <div className="rounded-2xl border border-dashed border-black/20 bg-white/70 px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-black">No conversations yet</h3>
              <p className="mt-2 text-sm text-black/60 sm:text-base">
                Browse locations and message a host to get started.
              </p>
              <Link
                href="/locations"
                className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Browse Locations
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
