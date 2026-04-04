'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarRange, CheckCircle2, Lock, Plus, Trash2 } from 'lucide-react';
import BookingCalendar from '@/components/BookingCalendar';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getHostListings, type HostListing } from '@/lib/host-dashboard-data';
import {
  DEFAULT_TIME_SLOTS,
  formatSelectedDate,
  getLocationBlockedDates,
  type TimeSlot,
} from '@/lib/availability';
import type { LocationAvailabilityBlock } from '@/types/location';

type ListingAvailabilityState = Record<string, LocationAvailabilityBlock[]>;

function countBlockedDays(blocks: LocationAvailabilityBlock[]) {
  return blocks.reduce((sum, block) => {
    const start = new Date(`${block.startDate}T12:00:00`);
    const end = new Date(`${block.endDate}T12:00:00`);
    return sum + Math.max(Math.round((end.getTime() - start.getTime()) / 86400000) + 1, 1);
  }, 0);
}

function createBlock(startDate: string, endDate: string, reason: string): LocationAvailabilityBlock {
  return {
    id: `block-${startDate}-${endDate}-${Math.random().toString(36).slice(2, 8)}`,
    startDate,
    endDate,
    reason: reason.trim() || undefined,
    blockedSlots: [...DEFAULT_TIME_SLOTS] as TimeSlot[],
    source: 'manual',
  };
}

export default function HostAvailabilityPage() {
  const listings = useMemo(() => getHostListings(), []);
  const [selectedListingId, setSelectedListingId] = useState(listings[0]?.id || '');
  const [blockedByListing, setBlockedByListing] = useState<ListingAvailabilityState>(() =>
    listings.reduce<ListingAvailabilityState>((acc, listing) => {
      acc[listing.id] = getLocationBlockedDates(listing.id);
      return acc;
    }, {})
  );
  const [draftStartDate, setDraftStartDate] = useState('');
  const [draftEndDate, setDraftEndDate] = useState('');
  const [draftReason, setDraftReason] = useState('');
  const [calendarSelection, setCalendarSelection] = useState<{ selectedDate: string; selectedDates?: string[]; selectedTimeSlots: string[]; isMultiDay?: boolean }>({
    selectedDate: '',
    selectedTimeSlots: [],
  });

  const selectedListing = listings.find((listing) => listing.id === selectedListingId) as HostListing | undefined;
  const blockedDates = blockedByListing[selectedListingId] || [];

  const availabilityMetrics = useMemo(() => {
    const activeListings = Object.values(blockedByListing).filter((blocks) => blocks.length > 0).length;
    const totalBlocks = Object.values(blockedByListing).reduce((sum, blocks) => sum + blocks.length, 0);
    const totalBlockedDays = Object.values(blockedByListing).reduce((sum, blocks) => sum + countBlockedDays(blocks), 0);
    return { activeListings, totalBlocks, totalBlockedDays };
  }, [blockedByListing]);

  const addBlock = () => {
    if (!selectedListingId || !draftStartDate || !draftEndDate) return;
    if (draftStartDate > draftEndDate) return;

    const nextBlock = createBlock(draftStartDate, draftEndDate, draftReason);
    setBlockedByListing((current) => ({
      ...current,
      [selectedListingId]: [...(current[selectedListingId] || []), nextBlock].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    }));
    setDraftStartDate('');
    setDraftEndDate('');
    setDraftReason('');
  };

  const toggleSingleDate = (dateKey: string) => {
    setBlockedByListing((current) => {
      const existing = current[selectedListingId] || [];
      const match = existing.find((block) => block.startDate === dateKey && block.endDate === dateKey);
      return {
        ...current,
        [selectedListingId]: match
          ? existing.filter((block) => block.id !== match.id)
          : [...existing, createBlock(dateKey, dateKey, 'Manual block from calendar')].sort((a, b) => a.startDate.localeCompare(b.startDate)),
      };
    });
  };

  const removeBlock = (blockId: string) => {
    setBlockedByListing((current) => ({
      ...current,
      [selectedListingId]: (current[selectedListingId] || []).filter((block) => block.id !== blockId),
    }));
  };

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Availability</h1>
          <p className="mt-2 text-blue-100/70">Block dates, manage blackout windows, and keep the guest-facing booking calendar honest.</p>
        </div>
        <Link href="/dashboard/host">
          <Button variant="outline" className="border-white/20 bg-transparent text-white hover:border-blue-500 hover:text-blue-300">
            Back to dashboard
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-blue-500/20 bg-white/[0.03] shadow-none"><CardHeader className="pb-2"><CardTitle className="text-sm text-blue-100">Listings with blocks</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-white">{availabilityMetrics.activeListings}</div></CardContent></Card>
        <Card className="border-blue-500/20 bg-white/[0.03] shadow-none"><CardHeader className="pb-2"><CardTitle className="text-sm text-blue-100">Blocked periods</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-white">{availabilityMetrics.totalBlocks}</div></CardContent></Card>
        <Card className="border-blue-500/20 bg-white/[0.03] shadow-none"><CardHeader className="pb-2"><CardTitle className="text-sm text-blue-100">Blocked days</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-white">{availabilityMetrics.totalBlockedDays}</div></CardContent></Card>
      </div>

      {/* API-backed availability calendar — select a listing to manage blocked dates */}
      <Card className="border-blue-500/20 bg-white/[0.03] shadow-none">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-white">Block dates (live)</CardTitle>
              <p className="mt-2 text-sm text-blue-100/70">Click a start date then an end date to block a range. Click a red date to unblock it. Changes are saved instantly.</p>
            </div>
            <select
              value={selectedListingId}
              onChange={(event) => setSelectedListingId(event.target.value)}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id} className="bg-slate-950">
                  {listing.name}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedListingId ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <AvailabilityCalendar
                propertyId={selectedListingId}
                hostMode={true}
              />
            </div>
          ) : (
            <p className="text-sm text-blue-100/60">Select a listing above to manage its availability.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-blue-500/20 bg-white/[0.03] shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-white">Calendar controls (legacy mock)</CardTitle>
                <p className="mt-2 text-sm text-blue-100/70">Tap any date to block or unblock it instantly. Guest calendars inherit these blocked dates.</p>
              </div>
              <select
                value={selectedListingId}
                onChange={(event) => setSelectedListingId(event.target.value)}
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              >
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id} className="bg-slate-950">
                    {listing.name}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedListing && (
              <>
                <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">{selectedListing.name}</p>
                      <p className="mt-1 text-sm text-blue-100/70">{selectedListing.city}, {selectedListing.state} • ${selectedListing.pricePerHour}/hr</p>
                    </div>
                    <div className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200">
                      {blockedDates.length} blocked periods
                    </div>
                  </div>
                </div>

                <BookingCalendar
                  bookings={selectedListing.bookings}
                  blockedDates={blockedDates}
                  hourlyRate={selectedListing.pricePerHour}
                  minimumBookingHours={selectedListing.minimumBookingHours || 3}
                  mode="host"
                  onSelectionChange={setCalendarSelection}
                  onDayToggle={toggleSingleDate}
                />
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-blue-500/20 bg-white/[0.03] shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><CalendarRange className="h-5 w-5 text-blue-300" /> Block a date range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-blue-100/80">
                  <span>Start date</span>
                  <input type="date" value={draftStartDate} onChange={(event) => setDraftStartDate(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-blue-500" />
                </label>
                <label className="space-y-2 text-sm text-blue-100/80">
                  <span>End date</span>
                  <input type="date" value={draftEndDate} onChange={(event) => setDraftEndDate(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-blue-500" />
                </label>
              </div>
              <label className="space-y-2 text-sm text-blue-100/80">
                <span>Reason (optional)</span>
                <textarea value={draftReason} onChange={(event) => setDraftReason(event.target.value)} rows={3} placeholder="Owner stay, maintenance, cleaning, personal hold..." className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-blue-500" />
              </label>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={addBlock} disabled={!draftStartDate || !draftEndDate || draftStartDate > draftEndDate}>
                <Plus className="mr-2 h-4 w-4" />
                Save blocked period
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-white/[0.03] shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><Lock className="h-5 w-5 text-blue-300" /> Existing blocked dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {blockedDates.map((block) => (
                <div key={block.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">{formatSelectedDate(block.startDate)}{block.endDate !== block.startDate ? ` → ${formatSelectedDate(block.endDate)}` : ''}</p>
                      <p className="mt-1 text-sm text-white/65">{block.reason || 'No reason added'}</p>
                    </div>
                    <Button variant="outline" className="border-red-500/30 bg-transparent text-red-300 hover:border-red-500 hover:text-red-200" onClick={() => removeBlock(block.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
              {blockedDates.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-center text-sm text-white/60">
                  No blocked periods yet for this listing.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/10 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><CheckCircle2 className="h-5 w-5 text-blue-200" /> Integration status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-100/85">
              <p>• Host blocks are passed straight into the shared booking calendar component.</p>
              <p>• Guest-facing listing pages treat blocked dates as unavailable and prevent booking.</p>
              <p>• State is mock/local today, but the data shape is ready for an API-backed availability service.</p>
              {calendarSelection.selectedDate && (
                <p className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white/80">
                  Last calendar click: {formatSelectedDate(calendarSelection.selectedDate)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
