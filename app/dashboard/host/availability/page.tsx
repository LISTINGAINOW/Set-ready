'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarRange, CheckCircle2, Info } from 'lucide-react';
import AvailabilityCalendar, { type BlockedDateRange } from '@/components/AvailabilityCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getHostListings } from '@/lib/host-dashboard-data';

export default function HostAvailabilityPage() {
  const listings = useMemo(() => getHostListings(), []);
  const [selectedListingId, setSelectedListingId] = useState(listings[0]?.id || '');
  const [recentBlocks, setRecentBlocks] = useState<BlockedDateRange[]>([]);

  const selectedListing = listings.find((l) => l.id === selectedListingId);

  const handleBlockAdded = (block: BlockedDateRange) => {
    setRecentBlocks((prev) => [block, ...prev].slice(0, 10));
  };

  const handleBlockRemoved = (id: string) => {
    setRecentBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Availability</h1>
          <p className="mt-2 text-blue-100/70">
            Block dates so guests can&apos;t book during owner stays, maintenance windows, or holds.
            Changes sync instantly to listing pages.
          </p>
        </div>
        <Link href="/dashboard/host">
          <Button variant="outline" className="border-white/20 bg-transparent text-white hover:border-blue-500 hover:text-blue-300">
            Back to dashboard
          </Button>
        </Link>
      </div>

      {/* Listing selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="shrink-0 text-sm font-medium text-blue-100/70">Manage listing:</label>
        <select
          value={selectedListingId}
          onChange={(e) => {
            setSelectedListingId(e.target.value);
            setRecentBlocks([]);
          }}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
        >
          {listings.map((listing) => (
            <option key={listing.id} value={listing.id} className="bg-slate-950">
              {listing.name}
            </option>
          ))}
        </select>
        {selectedListing && (
          <span className="text-sm text-blue-100/50">
            {selectedListing.city}, {selectedListing.state} · ${selectedListing.pricePerHour}/hr
          </span>
        )}
      </div>

      {/* Calendar + instructions */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.5fr]">
        <Card className="border-blue-500/20 bg-white/[0.03] shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CalendarRange className="h-5 w-5 text-blue-300" />
              Blocked dates calendar
            </CardTitle>
            <p className="mt-1 text-sm text-blue-100/60">
              Click a start date, then an end date to block a range. Click any red (blocked) date to unblock it.
            </p>
          </CardHeader>
          <CardContent>
            {selectedListingId ? (
              <AvailabilityCalendar
                propertyId={selectedListingId}
                hostMode={true}
                onBlockAdded={handleBlockAdded}
                onBlockRemoved={handleBlockRemoved}
              />
            ) : (
              <p className="text-sm text-blue-100/60 py-6 text-center">Select a listing above to manage its availability.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* How it works */}
          <Card className="border-blue-500/20 bg-white/[0.03] shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <Info className="h-4 w-4 text-blue-300" />
                How blocking works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-blue-100/70">
              <p>• <strong className="text-blue-100">Click a start date</strong> on the calendar</p>
              <p>• <strong className="text-blue-100">Click an end date</strong> to define the range</p>
              <p>• Add an optional reason (maintenance, owner stay…)</p>
              <p>• Hit <strong className="text-blue-100">Block these dates</strong> — saves to Supabase immediately</p>
              <p>• <strong className="text-blue-100">Click any red date</strong> to remove that block instantly</p>
              <p className="pt-2 border-t border-white/10">Blocked dates appear on the guest-facing listing page calendar in real time.</p>
            </CardContent>
          </Card>

          {/* Recent activity */}
          {recentBlocks.length > 0 && (
            <Card className="border-blue-500/20 bg-white/[0.03] shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Recently blocked
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-blue-100/70">
                {recentBlocks.map((b) => (
                  <div key={b.id} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                    <p className="font-medium text-white">{b.start_date} → {b.end_date}</p>
                    {b.reason && <p className="text-blue-100/50 mt-0.5">{b.reason}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
