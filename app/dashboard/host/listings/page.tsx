'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Edit3, Eye, MapPin, Plus, Power, Search, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getHostBookings, getHostListings, type HostListing } from '@/lib/host-dashboard-data';

function badgeClasses(active: boolean) {
  return active
    ? 'border-green-500/30 bg-green-500/10 text-green-300'
    : 'border-white/10 bg-white/5 text-white/60';
}

export default function HostListingsPage() {
  const [query, setQuery] = useState('');
  const [listings, setListings] = useState<HostListing[]>(getHostListings());
  const bookings = getHostBookings();

  const filteredListings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (!normalized) return true;
      return [listing.title, listing.city, listing.state, listing.propertyType].join(' ').toLowerCase().includes(normalized);
    });
  }, [listings, query]);

  const listingStats = useMemo(() => {
    const active = listings.filter((listing) => listing.active).length;
    const inactive = listings.length - active;
    const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0);
    return { active, inactive, totalViews };
  }, [listings]);

  const bookingCounts = useMemo(() => {
    return bookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.locationId] = (acc[booking.locationId] || 0) + 1;
      return acc;
    }, {});
  }, [bookings]);

  const toggleListing = (id: string) => {
    setListings((current) => current.map((listing) => (listing.id === id ? { ...listing, active: !listing.active } : listing)));
  };

  const deleteListing = (id: string) => {
    setListings((current) => current.filter((listing) => listing.id !== id));
  };

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My listings</h1>
          <p className="mt-2 text-blue-100/70">Edit property details, toggle visibility, and prune stale inventory.</p>
        </div>
        <Link href="/list-property">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add listing
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-blue-500/20 bg-white/[0.03] shadow-none">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-100">Active</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-white">{listingStats.active}</div></CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-white/[0.03] shadow-none">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-100">Inactive</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-white">{listingStats.inactive}</div></CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-white/[0.03] shadow-none">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-100">Total views</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-white">{listingStats.totalViews}</div></CardContent>
        </Card>
      </div>

      <Card className="border-blue-500/20 bg-white/[0.03] shadow-none">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-white">Listing inventory</CardTitle>
              <p className="mt-2 text-sm text-blue-100/70">Mock controls today, easy swap to mutations later.</p>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200/70" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search listings"
                className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="grid gap-4 rounded-3xl border border-white/10 bg-black/40 p-4 lg:grid-cols-[1.5fr_0.8fr_0.7fr] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-white">{listing.title}</h2>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${badgeClasses(listing.active)}`}>
                    {listing.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-blue-100/75">
                  <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{listing.city}, {listing.state}</span>
                  <span>{listing.propertyType}</span>
                  <span>{listing.privacyTier}</span>
                </div>
                <p className="mt-3 text-sm text-white/70 line-clamp-2">{listing.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-blue-100/70">Rate</p>
                  <p className="mt-1 font-semibold text-white">${listing.price}/hr</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-blue-100/70">Views</p>
                  <p className="mt-1 font-semibold text-white">{listing.views}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-blue-100/70">Bookings</p>
                  <p className="mt-1 font-semibold text-white">{bookingCounts[listing.id] || 0}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-blue-100/70">Updated</p>
                  <p className="mt-1 font-semibold text-white">{listing.lastUpdated}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Button variant="outline" className="border-white/20 bg-transparent text-white hover:border-blue-500 hover:text-blue-300">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline" className="border-white/20 bg-transparent text-white hover:border-blue-500 hover:text-blue-300">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:border-blue-500 hover:text-blue-300"
                  onClick={() => toggleListing(listing.id)}
                >
                  <Power className="mr-2 h-4 w-4" />
                  {listing.active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500/30 bg-transparent text-red-300 hover:border-red-500 hover:text-red-200"
                  onClick={() => deleteListing(listing.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {filteredListings.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-10 text-center text-sm text-white/60">
              No listings match that search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
