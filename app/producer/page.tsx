"use client";

import { useEffect, useState } from 'react';
import { MapPin, Calendar, DollarSign, Heart, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

type Booking = {
  id: string;
  locationId: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  productionType: string;
  status: string;
};

type Location = {
  id: string;
  name: string;
  city: string;
  state: string;
  pricePerHour: number;
};

type Favorite = {
  id: string;
  locationId: string;
};

export default function ProducerOverview() {
  const [activeBookings, setActiveBookings] = useState(0);
  const [upcomingShoots, setUpcomingShoots] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const bookingsRes = await fetch('/api/bookings');
        const bookingsData = await bookingsRes.json();
        const bookings: Booking[] = bookingsData.bookings || [];

        const locationsRes = await fetch('/api/locations');
        const locationsData = await locationsRes.json();
        const locations: Location[] = locationsData.locations || [];

        const favRes = await fetch('/api/favorites?producerId=producer_001');
        const favData = await favRes.json();
        const favorites: Favorite[] = favData.favorites || [];

        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const active = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
        const upcoming = bookings.filter((b) => {
          const bookingDate = new Date(b.date);
          return bookingDate >= now && bookingDate <= sevenDaysFromNow && (b.status === 'confirmed' || b.status === 'pending');
        });

        let spent = 0;
        bookings.forEach((b) => {
          if (b.status === 'confirmed') {
            const loc = locations.find((l) => l.id === b.locationId);
            if (loc) spent += loc.pricePerHour * 4;
          }
        });

        setActiveBookings(active.length);
        setUpcomingShoots(upcoming.length);
        setTotalSpent(spent);
        setFavoriteCount(favorites.length);
        setUpcomingBookings(upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3));
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const stats = [
    { label: 'Active Bookings', value: activeBookings, icon: Calendar, color: 'bg-blue-500' },
    { label: 'Upcoming Shoots (7d)', value: upcomingShoots, icon: MapPin, color: 'bg-green-500' },
    { label: 'Total Spent (est.)', value: `$${totalSpent}`, icon: DollarSign, color: 'bg-blue-500' },
    { label: 'Favorite Locations', value: favoriteCount, icon: Heart, color: 'bg-pink-500' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-blue-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Producer Dashboard</h1>
        <p className="text-blue-500">Manage your bookings, discover locations, and track your shoots.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} flex h-12 w-12 items-center justify-center rounded-full`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/producer/search" className="flex items-center space-x-3 rounded-lg bg-blue-600 px-6 py-3 transition-colors hover:bg-blue-700 text-white">
            <MapPin className="h-5 w-5" />
            <span>Search Locations</span>
          </Link>
          <Link href="/producer/bookings" className="flex items-center space-x-3 rounded-lg border border-slate-200 bg-white text-slate-900 px-6 py-3 transition-colors hover:bg-blue-600 hover:text-white hover:border-blue-600">
            <Calendar className="h-5 w-5" />
            <span>View My Bookings</span>
          </Link>
          <Link href="/producer/insurance" className="flex items-center space-x-3 rounded-lg border border-slate-200 bg-white text-slate-900 px-6 py-3 transition-colors hover:bg-blue-600 hover:text-white hover:border-blue-600">
            <Shield className="h-5 w-5" />
            <span>Manage Insurance</span>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Insurance</h2>
            <p className="mt-1 text-sm text-slate-500">Upload certificates, track expiration dates, and keep booking approvals moving.</p>
          </div>
          <Link href="/producer/insurance" className="flex items-center space-x-2 text-blue-600 hover:text-blue-500">
            <span>Open</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="font-semibold text-slate-900">Minimum $1M general liability required</p>
          <p className="mt-2 text-sm text-slate-500">No backend verification yet — current dashboard supports simple PDF upload, expiration tracking, and reminders.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Upcoming Bookings</h2>
          <Link href="/producer/bookings" className="flex items-center space-x-2 text-blue-600 hover:text-blue-500">
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{booking.name}</p>
                  <p className="text-sm text-slate-500">{booking.date} • {booking.startTime}–{booking.endTime}</p>
                  <p className="text-sm text-slate-700">{booking.productionType}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-900/30 text-green-400'
                        : booking.status === 'pending'
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {booking.status}
                  </span>
                  <Link href={`/locations/${booking.locationId}`} className="text-sm text-blue-600 hover:text-blue-500">
                    View Location
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-blue-500">
            No upcoming bookings. <Link href="/producer/search" className="text-blue-600 hover:underline">Search for locations</Link> to book your next shoot.
          </div>
        )}
      </div>
    </div>
  );
}
