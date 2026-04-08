'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') ?? null;
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('Missing Stripe checkout session.');
      return;
    }

    fetch(`/api/payments/session?session_id=${sessionId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load payment status');
        }
        if (!data.bookingId) {
          throw new Error('Payment session is missing a booking id');
        }
        router.replace(`/booking/confirmation?bookingId=${encodeURIComponent(data.bookingId)}`);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load booking confirmation');
      });
  }, [router, sessionId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {error ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">We couldn't load your confirmation</h1>
            <p className="mb-6 text-sm text-gray-600">{error}</p>
            <Link
              href="/producer/bookings"
              className="inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Go to my bookings
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Payment received</h1>
            <p className="mb-6 text-sm text-gray-600">
              We're loading your live booking confirmation from the database.
            </p>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          </>
        )}
      </div>
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
