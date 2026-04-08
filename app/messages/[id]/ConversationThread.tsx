"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, MessageSquare, Send } from 'lucide-react';
import MessageBubble from '@/components/MessageBubble';
import type { ConversationMessage } from '@/types/message';

interface ConversationSummary {
  id: string;
  bookingId?: string;
  propertyId: string;
  propertyTitle: string;
  guestName: string;
  hostName: string;
  hostId: string;
  guestId: string;
  unreadCount: number;
  lastMessageAt: string;
}

interface ThreadResponse {
  conversation: ConversationSummary;
  messages: ConversationMessage[];
  currentUserId: string;
}

interface ConversationThreadProps {
  conversationId: string;
}

export default function ConversationThread({ conversationId }: ConversationThreadProps) {
  const router = useRouter();
  const [conversation, setConversation] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadThread() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/conversations/${conversationId}/messages`, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.status === 401) {
          router.push(`/login?redirect=/messages/${conversationId}`);
          return;
        }

        const data = (await response.json()) as Partial<ThreadResponse> & { error?: string };

        if (!response.ok || !data.conversation) {
          throw new Error(data.error || 'Failed to load conversation.');
        }

        if (!isMounted) return;

        setConversation(data.conversation);
        setMessages(Array.isArray(data.messages) ? data.messages : []);
        setCurrentUserId(typeof data.currentUserId === 'string' ? data.currentUserId : '');

        void fetch(`/api/conversations/${conversationId}/messages`, {
          method: 'PATCH',
          credentials: 'include',
        }).then(async (markReadResponse) => {
          if (!markReadResponse.ok || !isMounted) return;
          setConversation((prev) => (prev ? { ...prev, unreadCount: 0 } : prev));
        }).catch(() => {
          // Non-blocking best effort.
        });
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load conversation.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadThread();

    return () => {
      isMounted = false;
    };
  }, [conversationId, router]);

  const canSend = draft.trim().length > 0 && !isSending;

  const threadTitle = useMemo(() => {
    if (!conversation) return 'Conversation';
    return conversation.propertyTitle;
  }, [conversation]);

  async function handleSend() {
    if (!draft.trim()) return;

    try {
      setIsSending(true);
      setError(null);

      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: draft.trim() }),
      });

      if (response.status === 401) {
        router.push(`/login?redirect=/messages/${conversationId}`);
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.message) {
        throw new Error(data.error || 'Failed to send message.');
      }

      setMessages((prev) => [...prev, data.message as ConversationMessage]);
      setConversation((prev) => (
        prev
          ? {
              ...prev,
              lastMessageAt: (data.message as ConversationMessage).timestamp,
            }
          : prev
      ));
      setDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="rounded-3xl border border-black/10 bg-white px-6 py-16 text-center shadow-sm">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-black/60 sm:text-base">Loading conversation…</p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="mb-6">
          <Link href="/messages" className="inline-flex min-h-[44px] items-center gap-2 text-sm text-black/60 hover:text-black sm:text-base">
            <ArrowLeft className="h-4 w-4" />
            Back to messages
          </Link>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-16 text-center shadow-sm">
          <MessageSquare className="mx-auto h-8 w-8 text-red-600" />
          <h1 className="mt-4 text-2xl font-bold text-black">Conversation unavailable</h1>
          <p className="mt-2 text-sm text-black/60 sm:text-base">{error || 'We could not load this conversation.'}</p>
        </div>
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_360px] lg:items-start">
        <section className="overflow-hidden rounded-3xl border border-black bg-white shadow-sm">
          <div className="border-b border-black/10 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Conversation</p>
                <h1 className="mt-2 text-2xl font-bold text-black sm:text-3xl">{threadTitle}</h1>
                <p className="mt-2 text-sm text-black/60 sm:text-base">
                  {conversation.guestName} with {conversation.hostName}
                </p>
              </div>
              {conversation.unreadCount > 0 && (
                <span className="inline-flex self-start rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  {conversation.unreadCount} unread
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4 bg-black/[0.02] px-4 py-5 sm:px-6 sm:py-6">
            {messages.length > 0 ? (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={
                    (message.sender === 'host' && currentUserId === conversation.hostId) ||
                    (message.sender === 'guest' && currentUserId === conversation.guestId)
                  }
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-10 text-center text-sm text-black/60">
                No messages yet.
              </div>
            )}
          </div>

          <div className="border-t border-black/10 bg-white px-4 py-4 sm:px-6 sm:py-5">
            <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-3 sm:p-4">
              <label htmlFor="reply" className="mb-2 block text-sm font-medium text-black">Reply</label>
              <textarea
                id="reply"
                rows={4}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type a reply…"
                className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-blue-600 sm:text-base"
              />
              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-black/45 sm:text-sm">Replies are sent live and email the other party automatically.</p>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!canSend}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isSending ? 'Sending…' : 'Send reply'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4 sm:space-y-5">
          <div className="rounded-3xl border border-black bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Property context</p>
            <h2 className="mt-3 text-2xl font-bold text-black">{conversation.propertyTitle}</h2>
            <p className="mt-4 text-sm leading-6 text-black/70">
              This thread is powered by your live SetVenue inbox. Open the property listing or keep the conversation going here.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-black/70">
                Property #{conversation.propertyId}
              </span>
              {conversation.bookingId && (
                <span className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-black/70">
                  Booking #{conversation.bookingId.replace('booking_', '')}
                </span>
              )}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/locations/${conversation.propertyId}`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-black px-4 py-3 text-sm font-semibold text-black transition hover:border-blue-600 hover:text-blue-600"
              >
                View property
              </Link>
              <Link
                href="/messages"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                All conversations
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
