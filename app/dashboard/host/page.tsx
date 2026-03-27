'use client';

import Link from 'next/link';
import { BadgeCheck, CalendarDays, CircleDollarSign, CreditCard, ExternalLink, HandCoins, Home, ShieldCheck, TrendingUp, UserCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getHostBookings, getHostMetrics, getHostProfile } from '@/lib/host-dashboard-data';

const hostMetrics = getHostMetrics();

const statCards = [
  {
    title: 'Active listings',
    value: hostMetrics.activeListings,
    note: `${hostMetrics.totalListings} total properties`,
    icon: Home,
  },
  {
    title: 'Pending requests',
    value: hostMetrics.pendingBookings,
    note: 'Needs review today',
    icon: CalendarDays,
  },
  {
    title: 'Revenue',
    value: `$${hostMetrics.monthlyRevenue.toLocaleString()}`,
    note: 'Confirmed booking payouts',
    icon: CircleDollarSign,
  },
  {
    title: 'Pending payouts',
    value: `$${hostMetrics.pendingPayouts.toLocaleString()}`,
    note: 'Scheduled for next cycle',
    icon: TrendingUp,
  },
];

const profile = getHostProfile();
const recentBookings = getHostBookings().slice(0, 4);
const hasListings = hostMetrics.totalListings > 0;

function statusClasses(status: string) {
  if (status === 'confirmed') return 'border-green-200 bg-green-100 text-green-700';
  if (status === 'pending') return 'border-yellow-200 bg-yellow-100 text-yellow-700';
  if (status === 'rejected') return 'border-red-200 bg-red-100 text-red-700';
  return 'border-slate-200 bg-slate-100 text-slate-600';
}

export default function HostDashboardPage() {
  return (
    <div className="space-y-8 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-blue-50 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-4 py-2 text-sm text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              Host command center
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Manage listings, bookings, payouts, and offers from one place.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Mock data for now, but the structure is ready for real APIs. Review booking demand, respond to price negotiations,
              monitor earnings, and keep host operations tight without bouncing between pages.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/dashboard/host/listings">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Manage listings</Button>
            </Link>
            <Link href="/dashboard/host/bookings">
              <Button variant="outline" className="w-full border-slate-200 bg-white text-slate-900 hover:bg-blue-600 hover:text-white hover:border-blue-600">
                Review bookings
              </Button>
            </Link>
            <Link href="/dashboard/host/availability">
              <Button variant="outline" className="w-full border-slate-200 bg-white text-slate-900 hover:bg-blue-600 hover:text-white hover:border-blue-600">
                Manage availability
              </Button>
            </Link>
            <Link href="/dashboard/host/offers">
              <Button variant="outline" className="w-full border-slate-200 bg-white text-slate-900 hover:bg-blue-600 hover:text-white hover:border-blue-600">
                Review offers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-sm font-medium text-slate-600">{card.title}</CardTitle>
                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{card.value}</div>
                <p className="mt-2 text-sm text-slate-500">{card.note}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-slate-900">Recent booking activity</CardTitle>
                <p className="mt-2 text-sm text-slate-500">Newest requests and confirmed shoots across your properties.</p>
              </div>
              <Link href="/dashboard/host/bookings" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-slate-900">{booking.name}</p>
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusClasses(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {booking.productionType} • {booking.date} • {booking.startTime}–{booking.endTime}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Estimated host payout: ${booking.payout.toLocaleString()}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{booking.requestAge}</span>
                </div>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl">🗓️</div>
                <h3 className="mt-5 text-2xl font-semibold text-slate-900">No booking requests yet</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Once producers start reaching out, requests and confirmed shoots will show up here automatically.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Host profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                  <UserCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{profile.name}</p>
                  <p className="text-slate-500">{profile.email}</p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <BadgeCheck className="h-4 w-4" />
                    Verification status
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">{profile.verificationStatus}</p>
                  <p className="mt-1 text-slate-500">Response rate {profile.responseRate} • Typical reply {profile.responseTime}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <CreditCard className="h-4 w-4" />
                    Payment settings
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">{profile.payoutMethod}</p>
                  <p className="mt-1 text-slate-500">{profile.payoutSchedule}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">{hasListings ? 'Next steps' : 'No properties yet'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              {hasListings ? (
                <>
                  <p>• Sync listing edits to the future host API.</p>
                  <p>• Replace mock payout data with settlement records.</p>
                  <p>• Add real-time negotiation syncing between guest and host.</p>
                  <Link href="/dashboard/host/offers" className="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700">
                    Open offer inbox <HandCoins className="h-4 w-4" />
                  </Link>
                  <Link href="/dashboard/host/listings" className="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700">
                    Open host tools <ExternalLink className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">🏡</div>
                  <p className="text-center text-base text-slate-900">Your host dashboard is ready — it just needs its first listing.</p>
                  <p className="text-center text-slate-600">Add a property to unlock booking requests, payout tracking, and visibility insights.</p>
                  <div className="flex justify-center pt-2">
                    <Link href="/list-property" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
                      Add your first property <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
