'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SessionDetails {
  locationTitle: string;
  amountTotal: number;
  customerEmail: string;
}

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') ?? null;
  const [details, setDetails] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    fetch(`/api/payments/session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setDetails(data);
      })
      .catch(() => {
        // Session details unavailable, still show success
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {loading ? (
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
        ) : (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600 mb-6">
              Your payment was successful and the booking is confirmed.
            </p>

            {details && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6 text-left text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-gray-900">
                    {details.locationTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-medium text-gray-900">
                    ${(details.amountTotal / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Confirmation sent to</span>
                  <span className="font-medium text-gray-900">
                    {details.customerEmail}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Link
                href="/producer/bookings"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                View My Bookings
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>}>
      <BookingSuccessContent />
    </Suspense>
  );
}
