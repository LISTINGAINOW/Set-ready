'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BlockedDateRange {
  id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  reason?: string | null;
}

interface AvailabilityCalendarProps {
  propertyId: string;
  /** If true, show block/unblock controls (host mode) */
  hostMode?: boolean;
  /** Called after a block is added (host mode) */
  onBlockAdded?: (block: BlockedDateRange) => void;
  /** Called after a block is removed (host mode) */
  onBlockRemoved?: (id: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseYMD(s: string): Date {
  // Parse as local date (not UTC) to avoid off-by-one from timezone
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addMonths(d: Date, n: number): Date {
  const result = new Date(d);
  result.setMonth(result.getMonth() + n);
  result.setDate(1);
  return result;
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Returns array of Date objects for each day in the month, padded to full weeks */
function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];

  // Pad start with nulls (Sunday = 0)
  for (let i = 0; i < firstDay.getDay(); i++) days.push(null);

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // Pad end to complete last week
  while (days.length % 7 !== 0) days.push(null);

  return days;
}

/** Check if a date falls within any blocked range */
function isBlocked(dateStr: string, blocks: BlockedDateRange[]): BlockedDateRange | undefined {
  return blocks.find((b) => b.start_date <= dateStr && b.end_date >= dateStr);
}

function isPast(dateStr: string): boolean {
  return dateStr < toYMD(new Date());
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AvailabilityCalendar({
  propertyId,
  hostMode = false,
  onBlockAdded,
  onBlockRemoved,
}: AvailabilityCalendarProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  }, []);

  const [monthStart, setMonthStart] = useState<Date>(today);
  const [blockedDates, setBlockedDates] = useState<BlockedDateRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Host-mode form state
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const days = useMemo(() => getCalendarDays(year, month), [year, month]);

  // ── Fetch blocked dates ──────────────────────────────────────────────────
  const fetchBlocked = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/availability/${propertyId}`);
      if (!res.ok) throw new Error('Failed to load availability');
      const json = await res.json();
      setBlockedDates(json.blockedDates ?? []);
    } catch (err) {
      setError('Could not load availability. Please refresh.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchBlocked();
  }, [fetchBlocked]);

  // ── Host: block range ────────────────────────────────────────────────────
  const handleBlock = async () => {
    if (!selectedStart || !selectedEnd) return;
    const start = selectedStart < selectedEnd ? selectedStart : selectedEnd;
    const end = selectedStart < selectedEnd ? selectedEnd : selectedStart;

    setSaving(true);
    try {
      const res = await fetch(`/api/availability/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block', startDate: start, endDate: end, reason }),
      });
      if (!res.ok) throw new Error('Failed to block');
      const json = await res.json();
      setBlockedDates((prev) => [...prev, json.blockedDate].sort((a, b) => a.start_date.localeCompare(b.start_date)));
      onBlockAdded?.(json.blockedDate);
      setSelectedStart(null);
      setSelectedEnd(null);
      setReason('');
    } catch (err) {
      alert('Failed to save block. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Host: unblock ────────────────────────────────────────────────────────
  const handleUnblock = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/availability/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unblock', id }),
      });
      if (!res.ok) throw new Error('Failed to unblock');
      setBlockedDates((prev) => prev.filter((b) => b.id !== id));
      onBlockRemoved?.(id);
    } catch (err) {
      alert('Failed to remove block. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Day click (host mode: select range) ─────────────────────────────────
  const handleDayClick = (dateStr: string) => {
    if (!hostMode) return;
    if (!selectedStart || selectedEnd) {
      setSelectedStart(dateStr);
      setSelectedEnd(null);
    } else {
      setSelectedEnd(dateStr);
    }
  };

  // ── Day state ────────────────────────────────────────────────────────────
  const getDayState = (dateStr: string): 'past' | 'blocked' | 'in-selection' | 'available' => {
    if (isPast(dateStr)) return 'past';
    if (isBlocked(dateStr, blockedDates)) return 'blocked';
    if (hostMode && selectedStart && !selectedEnd) {
      const anchor = selectedStart;
      const hover = hovered ?? anchor;
      const rangeStart = anchor < hover ? anchor : hover;
      const rangeEnd = anchor < hover ? hover : anchor;
      if (dateStr >= rangeStart && dateStr <= rangeEnd) return 'in-selection';
    }
    if (hostMode && selectedStart && selectedEnd) {
      const rangeStart = selectedStart < selectedEnd ? selectedStart : selectedEnd;
      const rangeEnd = selectedStart < selectedEnd ? selectedEnd : selectedStart;
      if (dateStr >= rangeStart && dateStr <= rangeEnd) return 'in-selection';
    }
    return 'available';
  };

  const dayClass = (state: ReturnType<typeof getDayState>, isToday: boolean): string => {
    const base = 'w-full aspect-square flex items-center justify-center rounded-md text-sm font-medium transition-colors';
    if (state === 'past') return `${base} text-gray-300 cursor-default`;
    if (state === 'blocked') return `${base} bg-red-100 text-red-700 ${hostMode ? 'cursor-pointer hover:bg-red-200' : 'cursor-not-allowed'}`;
    if (state === 'in-selection') return `${base} bg-blue-200 text-blue-800 cursor-pointer`;
    // available
    return `${base} ${isToday ? 'ring-2 ring-green-500' : ''} bg-green-50 text-green-800 ${hostMode ? 'cursor-pointer hover:bg-green-100' : 'cursor-default'}`;
  };

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonthStart((m) => addMonths(m, -1))}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-base font-semibold text-gray-800">{monthLabel(monthStart)}</span>
        <button
          onClick={() => setMonthStart((m) => addMonths(m, 1))}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Loading / error */}
      {loading && (
        <div className="flex items-center justify-center py-8 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm">Loading availability…</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-xs font-medium text-gray-400 pb-1">{d}</div>
            ))}
            {days.map((day, idx) => {
              if (!day) return <div key={`pad-${idx}`} />;
              const dateStr = toYMD(day);
              const state = getDayState(dateStr);
              const isToday = dateStr === toYMD(new Date());
              const blockedBlock = state === 'blocked' ? isBlocked(dateStr, blockedDates) : undefined;

              return (
                <button
                  key={dateStr}
                  className={dayClass(state, isToday)}
                  onClick={() => {
                    if (hostMode && state === 'blocked' && blockedBlock) {
                      handleUnblock(blockedBlock.id);
                    } else if (state !== 'past') {
                      handleDayClick(dateStr);
                    }
                  }}
                  onMouseEnter={() => hostMode && setHovered(dateStr)}
                  onMouseLeave={() => hostMode && setHovered(null)}
                  title={
                    state === 'blocked' && blockedBlock
                      ? `Blocked${blockedBlock.reason ? `: ${blockedBlock.reason}` : ''}${hostMode ? ' — click to remove' : ''}`
                      : state === 'past'
                      ? 'Past date'
                      : hostMode
                      ? selectedStart && !selectedEnd
                        ? 'Click to set end date'
                        : 'Click to start a blocked range'
                      : 'Available'
                  }
                  disabled={saving}
                  aria-label={`${dateStr} — ${state}`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-100 inline-block" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-100 inline-block" /> Blocked
            </span>
            {hostMode && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-200 inline-block" /> Selected range
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gray-100 inline-block" /> Past
            </span>
          </div>

          {/* Host-mode block form */}
          {hostMode && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
              <p className="text-sm font-medium text-gray-700">
                {selectedStart && selectedEnd
                  ? `Block: ${selectedStart} → ${selectedEnd}`
                  : selectedStart
                  ? `Start: ${selectedStart} — click an end date on the calendar`
                  : 'Click a start date on the calendar to begin blocking'}
              </p>

              {selectedStart && selectedEnd && (
                <>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason (optional) — maintenance, owner stay…"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleBlock}
                      disabled={saving}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
                    >
                      {saving ? 'Saving…' : 'Block these dates'}
                    </button>
                    <button
                      onClick={() => { setSelectedStart(null); setSelectedEnd(null); setReason(''); }}
                      disabled={saving}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
