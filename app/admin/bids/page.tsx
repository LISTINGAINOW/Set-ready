'use client';

import { useState, useEffect } from 'react';

interface Bid {
  id: string;
  property_id: string;
  production_type: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  proposed_price: number;
  price_type: string;
  estimated_hours: number;
  preferred_dates: string;
  crew_size: number;
  description: string;
  special_requirements: string;
  status: string;
  counter_price: number | null;
  owner_message: string;
  responded_at: string | null;
  created_at: string;
}

const PRODUCTION_LABELS: Record<string, string> = {
  adult: '🔞 Adult Content',
  events: '🎉 Events',
  mainstream: '🎬 Film & TV',
  photo: '📸 Photography',
  other: '✨ Other',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  countered: 'bg-blue-100 text-blue-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-500',
  withdrawn: 'bg-gray-100 text-gray-500',
};

export default function AdminBidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [ownerMessage, setOwnerMessage] = useState('');

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const res = await fetch('/api/admin/bids');
      if (res.ok) {
        const data = await res.json();
        setBids(data.bids || []);
      }
    } catch (err) {
      console.error('Failed to fetch bids:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (bidId: string, action: 'accept' | 'counter' | 'decline') => {
    try {
      const res = await fetch('/api/bids/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidId,
          action,
          counterPrice: action === 'counter' ? parseFloat(counterPrice) : undefined,
          ownerMessage,
        }),
      });

      if (res.ok) {
        setRespondingTo(null);
        setCounterPrice('');
        setOwnerMessage('');
        fetchBids();
      }
    } catch (err) {
      console.error('Failed to respond:', err);
    }
  };

  const filteredBids = filter === 'all' ? bids : bids.filter((b) => b.status === filter);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-500">Loading bids...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Incoming Bids</h1>
        <p className="mt-2 text-gray-600">Review and respond to Name Your Price offers.</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-yellow-50 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{bids.filter((b) => b.status === 'pending').length}</div>
          <div className="text-sm text-yellow-700">Pending</div>
        </div>
        <div className="rounded-xl bg-green-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{bids.filter((b) => b.status === 'accepted').length}</div>
          <div className="text-sm text-green-700">Accepted</div>
        </div>
        <div className="rounded-xl bg-blue-50 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{bids.filter((b) => b.status === 'countered').length}</div>
          <div className="text-sm text-blue-700">Countered</div>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{bids.length}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'pending', 'accepted', 'countered', 'declined'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f ? 'bg-slate-950 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bids list */}
      {filteredBids.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-4xl">🎯</div>
          <h3 className="mt-4 text-lg font-semibold">No bids yet</h3>
          <p className="mt-2 text-gray-500">When production companies make offers, they&apos;ll appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBids.map((bid) => (
            <div key={bid.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{bid.company_name}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[bid.status]}`}>
                      {bid.status}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      {PRODUCTION_LABELS[bid.production_type] || bid.production_type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {bid.contact_name} · {bid.contact_email} · {bid.contact_phone}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${bid.proposed_price}{bid.price_type === 'hourly' ? '/hr' : ' flat'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {bid.estimated_hours}h · crew of {bid.crew_size}
                  </div>
                  {bid.price_type === 'hourly' && (
                    <div className="text-sm font-medium">
                      Total: ${(bid.proposed_price * bid.estimated_hours).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <p className="text-sm">{bid.description}</p>
                {bid.special_requirements && (
                  <p className="mt-2 text-sm text-gray-500">Special: {bid.special_requirements}</p>
                )}
                {bid.preferred_dates && (
                  <p className="mt-1 text-sm text-gray-500">Dates: {bid.preferred_dates}</p>
                )}
              </div>

              {bid.counter_price && (
                <div className="mt-3 rounded-xl bg-blue-50 p-3">
                  <span className="text-sm font-medium text-blue-800">Counter offer: ${bid.counter_price}/hr</span>
                  {bid.owner_message && <p className="mt-1 text-sm text-blue-700">{bid.owner_message}</p>}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <span>Property: {bid.property_id}</span>
                <span>{new Date(bid.created_at).toLocaleDateString()} {new Date(bid.created_at).toLocaleTimeString()}</span>
              </div>

              {/* Actions for pending bids */}
              {bid.status === 'pending' && (
                <div className="mt-4 border-t pt-4">
                  {respondingTo === bid.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium">Message to bidder</label>
                        <textarea
                          value={ownerMessage}
                          onChange={(e) => setOwnerMessage(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                          rows={2}
                          placeholder="Optional message..."
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Counter price ($/hr)</label>
                        <input
                          type="number"
                          value={counterPrice}
                          onChange={(e) => setCounterPrice(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                          placeholder="Your counter offer"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(bid.id, 'accept')}
                          className="rounded-full bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                        >
                          ✅ Accept Original
                        </button>
                        <button
                          onClick={() => {
                            if (!counterPrice) { alert('Enter a counter price'); return; }
                            handleRespond(bid.id, 'counter');
                          }}
                          className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                          💰 Send Counter
                        </button>
                        <button
                          onClick={() => handleRespond(bid.id, 'decline')}
                          className="rounded-full bg-red-100 px-4 py-2 text-sm text-red-600 hover:bg-red-200"
                        >
                          ❌ Decline
                        </button>
                        <button
                          onClick={() => { setRespondingTo(null); setCounterPrice(''); setOwnerMessage(''); }}
                          className="rounded-full px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRespondingTo(bid.id)}
                      className="rounded-full bg-slate-950 px-6 py-2 text-sm text-white hover:bg-blue-600"
                    >
                      Respond to Bid
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
