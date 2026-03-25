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
  if (status === 'confirmed') return 'border-green-500/30 bg-green-500/10 text-green-300';
  if (status === 'pending') return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200';
  if (status === 'rejected') return 'border-red-500/30 bg-red-500/10 text-red-300';
  return 'border-white/10 bg-white/5 text-white/70';
}

export default function HostDashboardPage() {
  return (
    <div className="space-y-8 text-white">
      <section className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-black to-black p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
              <ShieldCheck className="h-4 w-4" />
              Host command center
            </div>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Manage listings, bookings, payouts, and offers from one place.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/80 sm:text-base">
              Mock data for now, but the structure is ready for real APIs. Review booking demand, respond to price negotiations,
              monitor earnings, and keep host operations tight without bouncing between pages.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/dashboard/host/listings">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Manage listings</Button>
            </Link>
            <Link href="/dashboard/host/bookings">
              <Button variant="outline" className="w-full border-white/20 bg-transparent text-white hover:border-blue-500 hover:text-blue-300">
                Review bookings
              </Button>
            </Link>
            <Link href="/dashboard/host/availability">
              <Button variant="outline" className="w-full border-white/20 bg-transparent text-white hover:border-blue-500 hover:text-blue-300">
                Manage availability
              </Button>
            </Link>
            <Link href="/dashboard/host/offers">
              <Button variant="outline" className="w-full border-white/20 bg-transparent text-white hover:border-blue-500 hover:text-blue-300">
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
            <Card key={card.title} className="border-blue-500/20 bg-white/[0.03] text-white shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-sm font-medium text-blue-100">{card.title}</CardTitle>
                  <div className="rounded-xl bg-blue-500/10 p-2 text-blue-300">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{card.value}</div>
                <p className="mt-2 text-sm text-blue-100/70">{card.note}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-blue-500/20 bg-white/[0.03] text-white shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-white">Recent booking activity</CardTitle>
                <p className="mt-2 text-sm text-blue-100/70">Newest requests and confirmed shoots across your properties.</p>
              </div>
              <Link href="/dashboard/host/bookings" className="text-sm font-medium text-blue-300 hover:text-blue-200">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-white">{booking.name}</p>
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusClasses(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-blue-100/80">
                      {booking.productionType} • {booking.date} • {booking.startTime}–{booking.endTime}
                    </p>
                    <p className="mt-1 text-sm text-white/70">Estimated host payout: ${booking.payout.toLocaleString()}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-blue-200/70">{booking.requestAge}</span>
                </div>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-black/30 px-6 py-12 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 text-4xl">🗓️</div>
                <h3 className="mt-5 text-2xl font-semibold text-white">No booking requests yet</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-blue-100/70">Once producers start reaching out, requests and confirmed shoots will show up here automatically.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-blue-500/20 bg-white/[0.03] text-white shadow-none">
            <CardHeader>
              <CardTitle className="text-white">Host profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="rounded-full bg-blue-500/10 p-3 text-blue-300">
                  <UserCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-white">{profile.name}</p>
                  <p className="text-white/70">{profile.email}</p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-center gap-2 text-blue-200">
                    <BadgeCheck className="h-4 w-4" />
                    Verification status
                  </div>
                  <p className="mt-2 font-semibold text-white">{profile.verificationStatus}</p>
                  <p className="mt-1 text-white/70">Response rate {profile.responseRate} • Typical reply {profile.responseTime}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-center gap-2 text-blue-200">
                    <CreditCard className="h-4 w-4" />
                    Payment settings
                  </div>
                  <p className="mt-2 font-semibold text-white">{profile.payoutMethod}</p>
                  <p className="mt-1 text-white/70">{profile.payoutSchedule}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/10 text-white shadow-none">
            <CardHeader>
              <CardTitle className="text-white">{hasListings ? 'Next steps' : 'No properties yet'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-100/90">
              {hasListings ? (
                <>
                  <p>• Sync listing edits to the future host API.</p>
                  <p>• Replace mock payout data with settlement records.</p>
                  <p>• Add real-time negotiation syncing between guest and host.</p>
                  <Link href="/dashboard/host/offers" className="inline-flex items-center gap-2 font-medium text-white hover:text-blue-200">
                    Open offer inbox <HandCoins className="h-4 w-4" />
                  </Link>
                  <Link href="/dashboard/host/listings" className="inline-flex items-center gap-2 font-medium text-white hover:text-blue-200">
                    Open host tools <ExternalLink className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">🏡</div>
                  <p className="text-center text-base text-white">Your host dashboard is ready — it just needs its first listing.</p>
                  <p className="text-center text-blue-100/80">Add a property to unlock booking requests, payout tracking, and visibility insights.</p>
                  <div className="flex justify-center pt-2">
                    <Link href="/list-property" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-medium text-black hover:bg-blue-50 hover:text-blue-700">
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
