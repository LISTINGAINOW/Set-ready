import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, ExternalLink, Link as LinkIcon, MapPin, Send } from 'lucide-react';
import MessageBubble from '@/components/MessageBubble';
import messagesData from '@/data/messages.json';
import bookingsData from '@/data/bookings.json';
import locationsData from '@/data/locations.json';
import type { Booking, Location } from '@/types';
import type { MessageConversation } from '@/types/message';

const conversations = messagesData.conversations as MessageConversation[];
const bookings = bookingsData.bookings as Booking[];
const locations = locationsData as Location[];

function formatBookingDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversation = conversations.find((entry) => entry.id === id);

  if (!conversation) {
    notFound();
  }

  const booking = bookings.find((entry) => entry.id === conversation.bookingId);
  const location = locations.find((entry) => entry.id === conversation.propertyId);

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
                <h1 className="mt-2 text-2xl font-bold text-black sm:text-3xl">{conversation.propertyTitle}</h1>
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
            {conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} isOwnMessage={message.sender === 'host'} />
            ))}
          </div>

          <div className="border-t border-black/10 bg-white px-4 py-4 sm:px-6 sm:py-5">
            <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-3 sm:p-4">
              <label htmlFor="reply" className="mb-2 block text-sm font-medium text-black">Reply</label>
              <textarea
                id="reply"
                rows={4}
                placeholder="Type a reply…"
                className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-blue-600 sm:text-base"
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-black/45 sm:text-sm">Mock inbox only — reply input is present for UX, not persistence.</p>
                <button className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                  Send reply
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4 sm:space-y-5">
          <div className="rounded-3xl border border-black bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Property context</p>
            <h2 className="mt-3 text-2xl font-bold text-black">{conversation.propertyTitle}</h2>
            {location && (
              <>
                <div className="mt-4 flex items-start gap-3 text-sm text-black/70 sm:text-base">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span>
                    {location.address}, {location.city}, {location.state}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-black/70">{location.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-black/70">
                    {location.propertyType}
                  </span>
                  <span className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-black/70">
                    ${location.pricePerHour}/hour
                  </span>
                  <span className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-black/70">
                    {location.style}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link
                    href={`/locations/${location.id}`}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-black px-4 py-3 text-sm font-semibold text-black transition hover:border-blue-600 hover:text-blue-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View property
                  </Link>
                  <Link
                    href={`/dashboard/bookings?booking=${conversation.bookingId}`}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <LinkIcon className="h-4 w-4" />
                    View booking
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="rounded-3xl border border-black bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Booking snapshot</p>
            {booking ? (
              <div className="mt-4 space-y-4 text-sm text-black/70 sm:text-base">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <div>
                    <p className="font-semibold text-black">{formatBookingDate(booking.date)}</p>
                    <p>{booking.startTime} – {booking.endTime}</p>
                  </div>
                </div>
                <div>
                  <p className="text-black/50">Guest</p>
                  <p className="font-semibold text-black">{booking.name}</p>
                  <p>{booking.email}</p>
                </div>
                <div>
                  <p className="text-black/50">Production</p>
                  <p className="font-semibold text-black">{booking.productionType}</p>
                </div>
                <div>
                  <p className="text-black/50">Status</p>
                  <span className="mt-1 inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                    {booking.status}
                  </span>
                </div>
                <div>
                  <p className="text-black/50">Booking notes</p>
                  <p className="mt-1 leading-6 text-black/75">{booking.notes}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-black/60">No linked booking found for this conversation.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
