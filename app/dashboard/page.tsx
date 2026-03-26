'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, MapPin, Calendar, DollarSign, BadgePercent, TrendingUp, Bell, BookmarkPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import locationsData from '@/data/locations.json';
import bookingsData from '@/data/bookings.json';
import { getSavedSearchAlertLog, getSavedSearches, type SavedSearch } from '@/lib/saved-searches';

interface Location {
  id: string;
  name: string;
  pricePerHour: number;
  propertyType: string;
  style: string;
}

interface Booking {
  id: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  date: string;
  locationId: string;
  startTime: string;
  endTime: string;
  name: string;
}

const HOST_FEE_RATE = 0;

function getStats() {
  const locations: Location[] = locationsData as unknown as Location[];
  const bookings: Booking[] = (bookingsData.bookings || []) as Booking[];

  const totalLocations = locations.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const approvedThisMonth = bookings.filter(b => {
    if (b.status !== 'confirmed') return false;
    const bookingDate = new Date(b.date);
    return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
  }).length;

  let estimatedRevenue = 0;
  const locationMap = new Map(locations.map(loc => [loc.id, loc]));
  bookings.forEach(b => {
    if (b.status === 'confirmed') {
      const loc = locationMap.get(b.locationId);
      if (loc) {
        const start = parseInt(b.startTime.split(':')[0]);
        const end = parseInt(b.endTime.split(':')[0]);
        const hours = end - start;
        estimatedRevenue += loc.pricePerHour * (hours || 1);
      }
    }
  });

  const recentActivity = [...bookings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(b => {
      const loc = locationMap.get(b.locationId);
      return {
        id: b.id,
        locationName: loc?.name || 'Unknown',
        producer: b.name,
        date: b.date,
        status: b.status,
      };
    });

  return {
    totalLocations,
    pendingBookings,
    approvedThisMonth,
    estimatedRevenue,
    recentActivity,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchAlerts, setSearchAlerts] = useState<Array<{ message: string; createdAt: string }>>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }

    setSavedSearches(getSavedSearches());
    setSearchAlerts(getSavedSearchAlertLog());
  }, [router]);

  const stats = getStats();
  const ownerPayoutEstimate = stats.estimatedRevenue * (1 - HOST_FEE_RATE);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <p className="text-blue-500">
          {user ? `Welcome back, ${user.firstName}! Manage your locations and booking requests.` : 'Manage your locations and booking requests'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <Home className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLocations}</div>
            <p className="text-xs text-blue-500">Active listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Calendar className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            <p className="text-xs text-blue-500">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <MapPin className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedThisMonth}</div>
            <p className="text-xs text-blue-500">Confirmed bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.estimatedRevenue}</div>
            <p className="text-xs text-blue-500">From confirmed bookings</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-8 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-600">
              <BadgePercent className="h-4 w-4" />
              Your Earnings
            </div>
            <h2 className="mt-4 text-3xl font-bold text-black">0% host fees — you keep 100%</h2>
            <p className="mt-3 text-black/70">
              Transparent host pricing means more money in your pocket on every confirmed booking. You pay 0% as a host while producers see a 15% service fee at checkout.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-soft">
                <p className="text-sm text-blue-500">$1,000 booking</p>
                <p className="mt-2 text-2xl font-bold text-black">$1,000 payout</p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-soft">
                <p className="text-sm text-blue-500">Host fee</p>
                <p className="mt-2 text-2xl font-bold text-black">0%</p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-soft">
                <p className="text-sm text-blue-500">Estimated take-home</p>
                <p className="mt-2 text-2xl font-bold text-black">${ownerPayoutEstimate.toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 lg:max-w-sm">
            <div className="flex items-center gap-3 text-blue-600">
              <TrendingUp className="h-5 w-5" />
              <span className="font-semibold">Competitive edge</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-black/70">
              We take 0% from hosts. Giggster takes 15-20%.
            </p>
            <p className="mt-3 text-sm leading-6 text-black/70">
              On a $1,000 booking, you keep $1,000 with us. With them? Often $800-850.
            </p>
            <p className="mt-3 text-sm font-medium text-black">
              More privacy, more money, same bookings.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard/locations/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Add New Location
            </Button>
          </Link>
          <Link href="/dashboard/bookings?filter=pending">
            <Button variant="outline">
              View Pending Bookings
            </Button>
          </Link>
          <Link href="/list-property">
            <Button variant="outline">
              List a Property
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-soft">
            <table className="w-full">
              <thead className="border-b border-blue-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Producer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.map((activity) => (
                  <tr key={activity.id} className="border-b border-blue-100 transition-colors hover:bg-blue-50">
                    <td className="py-3 px-4">{activity.locationName}</td>
                    <td className="py-3 px-4">{activity.producer}</td>
                    <td className="py-3 px-4">{activity.date}</td>
                    <td className="py-3 px-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${activity.status === 'confirmed' ? 'bg-green-100 text-green-700' : activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : activity.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/dashboard/bookings/${activity.id}`} className="text-blue-600 hover:text-blue-600 text-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-2 text-blue-600">
              <BookmarkPlus className="h-5 w-5" />
              <h2 className="text-xl font-semibold text-black">Saved searches</h2>
            </div>
            <p className="mt-2 text-sm text-black/65">Quick access to search presets and local-only alert logs.</p>
            <div className="mt-4 space-y-3">
              {savedSearches.length > 0 ? savedSearches.slice(0, 4).map((search) => (
                <Link key={search.id} href={`/locations${search.query ? `?${search.query}` : ''}`} className="block rounded-xl border border-blue-100 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50">
                  <p className="font-semibold text-black">{search.name}</p>
                  <p className="mt-1 text-xs text-black/55">Saved {new Date(search.createdAt).toLocaleString()}</p>
                </Link>
              )) : <p className="rounded-xl border border-dashed border-blue-200 px-4 py-5 text-sm text-black/55">No saved searches yet. Save one from the browse page.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-soft">
            <div className="flex items-center gap-2 text-blue-600">
              <Bell className="h-5 w-5" />
              <h2 className="text-xl font-semibold text-black">Alert log</h2>
            </div>
            <p className="mt-2 text-sm text-black/65">Email alerts are intentionally log-only for now.</p>
            <div className="mt-4 space-y-3 text-sm text-black/75">
              {searchAlerts.length > 0 ? searchAlerts.slice(0, 4).map((alert) => (
                <div key={`${alert.createdAt}-${alert.message}`} className="rounded-xl border border-blue-100 bg-white px-4 py-3">
                  <p>{alert.message}</p>
                  <p className="mt-1 text-xs text-black/50">{new Date(alert.createdAt).toLocaleString()}</p>
                </div>
              )) : <p className="rounded-xl border border-dashed border-blue-200 px-4 py-5 text-black/55">No alert events logged yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
