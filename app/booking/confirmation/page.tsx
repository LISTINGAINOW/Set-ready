import Link from 'next/link';
import { CheckCircle2, CalendarDays, Clock3, MapPin, Receipt, Phone, Mail, Printer, ArrowRight, Shield } from 'lucide-react';
import locationsData from '@/data/locations.json';
import type { Location } from '@/types/location';

const locations: Location[] = locationsData as unknown as Location[];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return 'TBD';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatTime(value?: string) {
  if (!value) return 'TBD';
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatPhone(value?: string) {
  if (!value) return 'Host phone shared before arrival if needed';
  return value;
}

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const locationId = typeof params.locationId === 'string' ? params.locationId : '';
  const bookingId = typeof params.bookingId === 'string' ? params.bookingId : '';
  const bookingDate = typeof params.date === 'string' ? params.date : '';
  const startTime = typeof params.startTime === 'string' ? params.startTime : '';
  const endTime = typeof params.endTime === 'string' ? params.endTime : '';
  const total = typeof params.total === 'string' ? Number(params.total) : 0;
  const baseRate = typeof params.baseRate === 'string' ? Number(params.baseRate) : 0;
  const serviceFee = typeof params.serviceFee === 'string' ? Number(params.serviceFee) : 0;
  const guestName = typeof params.name === 'string' ? decodeURIComponent(params.name) : 'Guest';
  const insuranceStatus = typeof params.insuranceStatus === 'string' ? params.insuranceStatus : 'pending';
  const insuranceExpiry = typeof params.insuranceExpiry === 'string' ? params.insuranceExpiry : '';

  const location = locations.find((item) => item.id === locationId);
  const propertyTitle = location?.name || 'Booked property';
  const exactAddress = location?.address
    ? `${location.address}${location.city && location.state ? `, ${location.city}, ${location.state}` : ''}`
    : 'Exact address will be sent by the host shortly';
  const confirmationNumber = bookingId ? bookingId.replace('booking_', 'DS-').toUpperCase() : 'DS-PENDING';
  const hostEmail = 'hosts@setvenue.com';
  const hostPhone = '(323) 555-0147';

  const insuranceLabel =
    insuranceStatus === 'uploaded'
      ? 'Certificate uploaded'
      : insuranceStatus === 'partner-link'
        ? 'Partner link opened'
        : 'Still pending';

  const insuranceDescription =
    insuranceStatus === 'uploaded'
      ? `Insurance was added during checkout${insuranceExpiry ? ` and is marked to expire on ${insuranceExpiry}.` : '.'}`
      : insuranceStatus === 'partner-link'
        ? 'You chose a coverage partner during checkout. Upload the final PDF certificate from your producer dashboard when it is ready.'
        : 'You skipped the upload during checkout. Add a certificate from your producer dashboard before the shoot if the host asks for it.';

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-8 text-black print:bg-white print:px-0 print:py-0 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl print:max-w-none">
        <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
          <Link href="/producer/bookings" className="text-sm font-medium text-black/65 transition hover:text-black">
            ← Back to my bookings
          </Link>
          <button
            type="button"
            onClick={() => typeof window !== 'undefined' && window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-black bg-white px-4 py-2 text-sm font-semibold text-black transition hover:border-green-600 hover:text-green-700"
          >
            <Printer className="h-4 w-4" />
            Print confirmation
          </button>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] print:rounded-none print:border-0 print:shadow-none">
          <div className="border-b border-black/10 bg-gradient-to-br from-green-50 via-white to-green-100 px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-green-600 p-3 text-white shadow-lg shadow-green-600/20">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-700">Booking confirmed</p>
                  <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-black sm:text-4xl">You’re booked, {guestName.split(' ')[0]}.</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-black/70 sm:text-base">
                    The exact property address is now unlocked, your confirmation number is live, and the host contact details are below.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-green-200 bg-white/90 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Confirmation #</p>
                <p className="mt-2 font-mono text-xl font-bold text-black">{confirmationNumber}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r">
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-black">Booking details</h2>

              <div className="mt-6 rounded-3xl border border-black/10 bg-[#fafafa] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/45">Property</p>
                    <h3 className="mt-2 text-2xl font-bold text-black">{propertyTitle}</h3>
                  </div>
                  <Link href={location ? `/locations/${location.id}` : '/locations'} className="hidden rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:border-black sm:inline-flex">
                    View listing
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-black/55">
                      <CalendarDays className="h-4 w-4 text-green-600" />
                      Date
                    </div>
                    <p className="mt-2 text-base font-semibold text-black">{formatDate(bookingDate)}</p>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-black/55">
                      <Clock3 className="h-4 w-4 text-green-600" />
                      Time
                    </div>
                    <p className="mt-2 text-base font-semibold text-black">{formatTime(startTime)} – {formatTime(endTime)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-6">
                <div className="flex items-start gap-3">
                  <Shield className="mt-1 h-5 w-5 text-blue-600" />
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Insurance</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${insuranceStatus === 'uploaded' ? 'bg-blue-600 text-white' : insuranceStatus === 'partner-link' ? 'border border-blue-200 bg-white text-blue-700' : 'border border-black/10 bg-white text-black'}`}>
                        {insuranceLabel}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-black/72">{insuranceDescription}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-black/10 bg-white p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-black/45">
                    <MapPin className="h-4 w-4 text-green-600" />
                    Property address
                  </div>
                  <p className="mt-4 text-lg font-semibold leading-7 text-black">{exactAddress}</p>
                  <p className="mt-3 text-sm leading-6 text-black/65">
                    This exact address is revealed after booking so hosts keep privacy during discovery and guests get clarity once the reservation is locked.
                  </p>
                </div>

                <div className="rounded-3xl border border-black/10 bg-white p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-black/45">
                    <Receipt className="h-4 w-4 text-green-600" />
                    Price summary
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-black/75">
                    <div className="flex items-center justify-between">
                      <span>Base rate</span>
                      <span className="font-semibold text-black">{formatCurrency(Number.isFinite(baseRate) ? baseRate : 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Service fee</span>
                      <span className="font-semibold text-black">{formatCurrency(Number.isFinite(serviceFee) ? serviceFee : 0)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-black/10 pt-3 text-base font-bold text-black">
                      <span>Total paid</span>
                      <span>{formatCurrency(Number.isFinite(total) ? total : 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10">
              <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Host contact</p>
                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 text-green-700" />
                    <div>
                      <p className="text-sm text-black/55">Email</p>
                      <p className="font-semibold text-black">{hostEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 text-green-700" />
                    <div>
                      <p className="text-sm text-black/55">Phone</p>
                      <p className="font-semibold text-black">{formatPhone(hostPhone)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-black/10 bg-[#fafafa] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/45">What to expect next</p>
                <div className="mt-5 space-y-4">
                  {[
                    'You’ll receive a follow-up email with arrival notes, parking instructions, and any access details.',
                    'If the property has sensitive access rules or NDA steps, the host will confirm those before your arrival window.',
                    'Need to change something? Contact the host first, then support if timing or access needs get messy.',
                    'If insurance is still pending, upload your certificate from the producer dashboard so everything stays documented.',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-green-600 p-1 text-white">
                        <ArrowRight className="h-3 w-3" />
                      </div>
                      <p className="text-sm leading-6 text-black/75">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 print:hidden">
                <Link href="/producer/bookings" className="inline-flex items-center justify-center rounded-full bg-white border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-blue-600 hover:text-white hover:border-blue-600">
                  Go to my bookings
                </Link>
                <Link href="/locations" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-blue-600 hover:text-white hover:border-blue-600">
                  Browse more locations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
