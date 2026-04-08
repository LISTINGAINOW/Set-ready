import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/auth-middleware';
import { getBookingById, getPropertySummary } from '@/lib/booking-payment-pipeline';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value?: string | null) {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getPaymentCopy(paymentStatus: string, bookingStatus: string) {
  if (paymentStatus === 'paid' && bookingStatus === 'confirmed') {
    return {
      title: 'Booking confirmed',
      description: 'Your payment was successful and the booking is locked in.',
      badge: 'Paid',
      badgeClass: 'bg-green-100 text-green-800 border-green-200',
    };
  }

  if (paymentStatus === 'failed') {
    return {
      title: 'Payment failed',
      description: 'We could not process your payment. Please try checkout again.',
      badge: 'Payment failed',
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
    };
  }

  if (paymentStatus === 'expired') {
    return {
      title: 'Checkout expired',
      description: 'Your checkout session expired before payment completed. Start a new checkout session to confirm the booking.',
      badge: 'Expired',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    };
  }

  return {
    title: 'Payment pending',
    description: 'Your booking record exists, but payment has not completed yet.',
    badge: 'Pending payment',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  };
}

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const bookingId = typeof params.bookingId === 'string' ? params.bookingId : '';

  if (!bookingId) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Missing booking id</h1>
          <p className="mt-3 text-sm text-slate-600">Open this page from a booking flow so we can load your payment status from the database.</p>
          <Link href="/locations" className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
            Browse locations
          </Link>
        </div>
      </main>
    );
  }

  const sessionCookie = (await cookies()).get('ds-session')?.value;
  const userId = sessionCookie ? verifySessionCookie(sessionCookie) : null;
  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Sign in to view your booking</h1>
          <p className="mt-3 text-sm text-slate-600">Your confirmation page now loads live payment status from the database, so we need your session to verify the booking.</p>
          <Link href={`/login?redirect=${encodeURIComponent(`/booking/confirmation?bookingId=${bookingId}`)}`} className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const booking = await getBookingById(bookingId);
  if (!booking || (booking.renter_id && booking.renter_id !== userId)) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Booking not found</h1>
          <p className="mt-3 text-sm text-slate-600">We could not find a booking matching that confirmation link.</p>
          <Link href="/producer/bookings" className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
            Go to my bookings
          </Link>
        </div>
      </main>
    );
  }

  const property = await getPropertySummary(booking.property_id);
  const payment = getPaymentCopy(booking.payment_status ?? 'pending', booking.status);
  const start = booking.booking_start;
  const end = booking.booking_end;
  const propertyTitle = property?.property_name ?? 'Booked property';
  const address = property?.address
    ? `${property.address}${property.city && property.state ? `, ${property.city}, ${property.state}` : ''}`
    : 'Exact address shared after booking confirmation';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Live payment status</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">{payment.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{payment.description}</p>
            </div>
            <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${payment.badgeClass}`}>
              {payment.badge}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold">Booking details</h2>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Property</dt>
                <dd className="mt-2 text-lg font-semibold text-slate-900">{propertyTitle}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Booking ID</dt>
                <dd className="mt-2 font-mono text-sm text-slate-900">{booking.id}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Start</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(start)}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">End</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(end)}</dd>
              </div>
            </dl>

            <div className="mt-6 rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Address</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{address}</p>
            </div>

            {booking.notes && (
              <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Booking notes</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{booking.notes}</p>
              </div>
            )}
          </section>

          <aside className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold">Payment summary</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Base rate</span>
                <span className="font-semibold text-slate-900">{formatCurrency(Number(booking.base_rate ?? 0))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Service fee</span>
                <span className="font-semibold text-slate-900">{formatCurrency(Number(booking.service_fee ?? 0))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Security deposit</span>
                <span className="font-semibold text-slate-900">{formatCurrency(Number(booking.damage_deposit_amount ?? 0))}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(Number(booking.total_amount ?? 0))}</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-900">Booking status:</span> {booking.status}</p>
              <p className="mt-2"><span className="font-semibold text-slate-900">Payment status:</span> {booking.payment_status ?? 'pending'}</p>
              {booking.stripe_payment_intent_id && (
                <p className="mt-2 break-all"><span className="font-semibold text-slate-900">Stripe payment intent:</span> {booking.stripe_payment_intent_id}</p>
              )}
              {booking.payment_failed_reason && (
                <p className="mt-2 text-red-700"><span className="font-semibold">Failure reason:</span> {booking.payment_failed_reason}</p>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link href="/producer/bookings" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                Go to my bookings
              </Link>
              <Link href="/locations" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                Browse more locations
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
