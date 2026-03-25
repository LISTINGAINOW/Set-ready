'use client';

import { useMemo, useState } from 'react';
import { ArrowRightLeft, CheckCircle2, Clock3, HandCoins, MessageSquare, XCircle } from 'lucide-react';
import offersData from '@/data/offers.json';
import type { Offer, OfferStatus } from '@/types';

const tabs: Array<{ id: OfferStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All offers' },
  { id: 'pending', label: 'Pending' },
  { id: 'countered', label: 'Countered' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'declined', label: 'Declined' },
];

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

function getStatusClasses(status: OfferStatus) {
  if (status === 'pending') return 'border-blue-400/30 bg-blue-500/15 text-blue-100';
  if (status === 'accepted') return 'border-green-400/30 bg-green-500/15 text-green-100';
  if (status === 'declined') return 'border-red-400/30 bg-red-500/15 text-red-100';
  return 'border-yellow-400/30 bg-yellow-500/15 text-yellow-100';
}

export default function HostOffersPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('all');
  const [offers, setOffers] = useState<Offer[]>((offersData.offers || []) as Offer[]);

  const filteredOffers = useMemo(() => {
    if (activeTab === 'all') return offers;
    return offers.filter((offer) => offer.status === activeTab);
  }, [activeTab, offers]);

  const counts = useMemo(
    () => tabs.reduce<Record<string, number>>((acc, tab) => {
      acc[tab.id] = tab.id === 'all' ? offers.length : offers.filter((offer) => offer.status === tab.id).length;
      return acc;
    }, {}),
    [offers]
  );

  const updateOffer = (offerId: string, status: OfferStatus) => {
    setOffers((current) =>
      current.map((offer) => {
        if (offer.id !== offerId) return offer;

        const nextAmount = status === 'countered' ? Math.round((offer.proposedAmount + offer.originalAmount) / 2 / 50) * 50 : offer.proposedAmount;
        const nextDuration = status === 'countered' ? Math.max(offer.proposedDurationHours, offer.originalDurationHours) : offer.proposedDurationHours;

        return {
          ...offer,
          status,
          proposedAmount: nextAmount,
          proposedDurationHours: nextDuration,
          updatedAt: new Date().toISOString(),
          messages:
            status === 'countered'
              ? [
                  ...offer.messages,
                  {
                    id: `${offer.id}-counter-${offer.messages.length + 1}`,
                    sender: 'host',
                    message: `Countering at ${formatMoney(nextAmount)} for ${nextDuration} hours.`,
                    amount: nextAmount,
                    durationHours: nextDuration,
                    createdAt: new Date().toISOString(),
                  },
                ]
              : offer.messages,
        };
      })
    );
  };

  return (
    <div className="space-y-8 text-white">
      <section className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-black to-black p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
              <HandCoins className="h-4 w-4" />
              Negotiation inbox
            </div>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Review guest offers, counter fast, and keep price history clean.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/80 sm:text-base">
              Mock host tools for now, but the flow is here: guests can propose different pricing or duration, hosts can accept,
              decline, or counter, and every change stays visible in a lightweight negotiation thread.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5 text-sm text-blue-100">
            <p className="font-semibold text-white">Pending attention</p>
            <p className="mt-2 text-3xl font-bold text-blue-200">{counts.pending || 0}</p>
            <p className="mt-1">Blue cards need a response first.</p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 border-b border-white/10 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border-blue-400 bg-blue-500/15 text-white'
                : 'border-white/10 bg-white/[0.03] text-blue-100/80 hover:border-blue-400/40 hover:text-white'
            }`}
          >
            {tab.label}
            <span className="ml-2 rounded-full bg-black/40 px-2 py-0.5 text-xs">{counts[tab.id] || 0}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {filteredOffers.map((offer) => {
          const savings = offer.originalAmount - offer.proposedAmount;
          return (
            <article
              key={offer.id}
              className={`rounded-3xl border p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] ${
                offer.status === 'pending' ? 'border-blue-400/30 bg-blue-500/10' : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">{offer.locationTitle}</h2>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusClasses(offer.status)}`}>
                      {offer.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-blue-100/75">{offer.guestName} • {offer.guestEmail}</p>
                  <p className="mt-1 text-sm text-white/60">Requested for {formatDate(offer.requestedDate)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-right text-sm">
                  <p className="text-white/60">Latest update</p>
                  <p className="mt-1 font-semibold text-white">{formatDateTime(offer.updatedAt)}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">Original ask</p>
                  <p className="mt-2 text-2xl font-bold text-white">{formatMoney(offer.originalAmount)}</p>
                  <p className="mt-1 text-sm text-white/60">{offer.originalDurationHours} hours</p>
                </div>
                <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-blue-100/70">Current offer</p>
                  <p className="mt-2 text-2xl font-bold text-white">{formatMoney(offer.proposedAmount)}</p>
                  <p className="mt-1 text-sm text-blue-100/80">{offer.proposedDurationHours} hours</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">Delta</p>
                  <p className="mt-2 text-2xl font-bold text-white">{savings >= 0 ? '-' : '+'}{formatMoney(Math.abs(savings))}</p>
                  <p className="mt-1 text-sm text-white/60">vs original rate</p>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-black/30 p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <MessageSquare className="h-4 w-4 text-blue-300" />
                  Negotiation thread
                </div>
                <div className="space-y-3">
                  {offer.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-2xl border p-4 ${
                        message.sender === 'host'
                          ? 'ml-4 border-blue-400/20 bg-blue-500/10'
                          : 'mr-4 border-white/10 bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-white/50">
                        <span>{message.sender}</span>
                        <span>{formatDateTime(message.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/85">{message.message}</p>
                      {(message.amount || message.durationHours) && (
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-blue-100/80">
                          {message.amount ? <span className="rounded-full border border-blue-400/20 bg-black/30 px-3 py-1">{formatMoney(message.amount)}</span> : null}
                          {message.durationHours ? <span className="rounded-full border border-blue-400/20 bg-black/30 px-3 py-1">{message.durationHours}h</span> : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => updateOffer(offer.id, 'accepted')}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => updateOffer(offer.id, 'declined')}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-black/30 px-4 py-3 font-semibold text-white transition hover:border-red-400/40 hover:text-red-100"
                >
                  <XCircle className="h-4 w-4" />
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => updateOffer(offer.id, 'countered')}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 font-semibold text-blue-100 transition hover:bg-blue-500/20"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Counter
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredOffers.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center text-white/75">
          <Clock3 className="mx-auto h-12 w-12 text-blue-300" />
          <h3 className="mt-4 text-xl font-semibold text-white">No offers in this view</h3>
          <p className="mt-2 text-sm text-blue-100/70">New guest negotiations will show up here with price history and reply controls.</p>
        </div>
      )}
    </div>
  );
}
