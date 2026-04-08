"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquare, Search, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import type { MessageConversation } from '@/types/message';

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MessagesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<MessageConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConversations() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/conversations', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.status === 401) {
          router.push('/login?redirect=/messages');
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load conversations.');
        }

        if (!isMounted) return;

        const nextConversations = Array.isArray(data.conversations)
          ? (data.conversations as MessageConversation[])
          : [];

        setConversations(nextConversations);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load conversations.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadConversations();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const haystack = [
        conversation.propertyTitle,
        conversation.guestName,
        conversation.hostName,
        conversation.bookingId ?? '',
        conversation.messages[conversation.messages.length - 1]?.body ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [conversations, search]);

  const totalUnread = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Inbox</p>
          <h1 className="mt-2 text-3xl font-bold text-black sm:text-4xl">Messages</h1>
          <p className="mt-3 max-w-2xl text-sm text-black/60 sm:text-base">
            Keep hosts and guests aligned before the shoot. Search conversations, review property context, and jump back into any booking thread.
          </p>
        </div>
        <div className="rounded-2xl border border-blue-600/20 bg-blue-600/10 px-5 py-4 text-black">
          <p className="text-sm text-black/60">Unread messages</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{totalUnread}</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-black bg-white p-3 shadow-sm sm:p-4">
        <label className="flex items-center gap-3 rounded-xl bg-black/[0.03] px-4 py-3">
          <Search className="h-5 w-5 text-black/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by guest, host, property, booking, or message"
            className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/40 sm:text-base"
          />
        </label>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-black/10 bg-white px-6 py-16 text-center shadow-sm">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-black/60 sm:text-base">Loading your conversations…</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
          <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
          <h3 className="mt-4 text-xl font-semibold text-black">Couldn't load your inbox</h3>
          <p className="mt-2 text-sm text-black/60 sm:text-base">{error}</p>
        </div>
      )}

      {!isLoading && !error && filteredConversations.length > 0 && (
        <div className="space-y-4">
          {filteredConversations.map((conversation) => {
            const lastMessage = conversation.messages[conversation.messages.length - 1];

            return (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="block rounded-2xl border border-black bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-600/30 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-black">{conversation.propertyTitle}</h2>
                      {conversation.unreadCount > 0 && (
                        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                          {conversation.unreadCount} unread
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-black/60 sm:text-base">
                      {conversation.guestName} ↔ {conversation.hostName}
                    </p>
                    <p className="mt-4 line-clamp-2 text-sm text-black/75 sm:text-base">{lastMessage?.body ?? 'No messages yet.'}</p>
                  </div>

                  <div className="flex flex-col gap-3 lg:items-end">
                    <p className="text-sm text-black/50">{formatTimestamp(conversation.lastMessageAt)}</p>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {conversation.bookingId && (
                        <span className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-black/70">
                          Booking #{conversation.bookingId.replace('booking_', '')}
                        </span>
                      )}
                      <span className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-black/70">
                        Property #{conversation.propertyId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4 text-sm text-black/60">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{conversation.messages.length} messages</span>
                  </div>
                  <span className="inline-flex items-center gap-2 font-medium text-blue-600">
                    Open conversation
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!isLoading && !error && filteredConversations.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/20 bg-white/70 px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
            <MessageSquare className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-black">
            {conversations.length === 0 ? 'No conversations yet' : 'No conversations match that search'}
          </h3>
          <p className="mt-2 text-sm text-black/60 sm:text-base">
            {conversations.length === 0
              ? 'When you message a host or guest, your conversation will appear here.'
              : 'Try another guest name, booking ID, or property title.'}
          </p>
        </div>
      )}
    </div>
  );
}
