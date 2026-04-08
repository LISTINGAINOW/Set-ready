'use client';

import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  bookingId: string;
  locationTitle: string;
  pricePerHour: number;
  hours: number;
}

export default function CheckoutButton({
  bookingId,
  locationTitle,
  pricePerHour,
  hours,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const basePrice = pricePerHour * hours;
  const serviceFee = basePrice * 0.1;
  const total = basePrice + serviceFee;

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Booking Summary</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>
            ${pricePerHour.toFixed(2)} x {hours} hour{hours !== 1 ? 's' : ''}
          </span>
          <span>${basePrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>SetVenue service fee (10%)</span>
          <span>${serviceFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-3 font-semibold text-gray-900">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        {loading ? 'Redirecting...' : `Pay for ${locationTitle}`}
      </button>
    </div>
  );
}
