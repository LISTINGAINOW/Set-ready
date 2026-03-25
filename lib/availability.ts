import locationsData from '@/data/locations.json';
import type { Location, LocationAvailabilityBlock, LocationBooking } from '@/types/location';

export const DEFAULT_TIME_SLOTS = ['9am-12pm', '12pm-3pm', '3pm-6pm', '6pm-9pm'] as const;

export type TimeSlot = (typeof DEFAULT_TIME_SLOTS)[number];

export type AvailabilityCalendarDay = {
  dateKey: string;
  dayNumber: number;
  inMonth: boolean;
  isPast: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  bookedSlots: string[];
  availableSlots: string[];
  isAvailable: boolean;
};

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

export function formatMonth(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatSelectedDate(dateKey: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(parseDateKey(dateKey));
}

export function getDateRange(startDate: string, endDate: string) {
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);
  const range: string[] = [];

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return range;
  }

  const cursor = new Date(start);
  while (cursor <= end) {
    range.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return range;
}

export function buildAvailabilityMap({
  bookings = [],
  blockedDates = [],
  fallbackWindowDays = 60,
  today,
}: {
  bookings?: LocationBooking[];
  blockedDates?: LocationAvailabilityBlock[];
  fallbackWindowDays?: number;
  today: Date;
}) {
  const map = new Map<string, { availableSlots: string[]; bookedSlots: string[]; isBlocked: boolean; blockedReason?: string }>();

  const dateKeys = new Set<string>();

  bookings.forEach((booking) => {
    dateKeys.add(booking.date);
  });

  blockedDates.forEach((block) => {
    getDateRange(block.startDate, block.endDate).forEach((dateKey) => dateKeys.add(dateKey));
  });

  for (let offset = 0; offset < fallbackWindowDays; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    dateKeys.add(toDateKey(date));
  }

  Array.from(dateKeys)
    .sort()
    .forEach((dateKey) => {
      const booking = bookings.find((item) => item.date === dateKey);
      const bookedSlots = Array.from(new Set((booking?.timeSlots || []).filter((slot) => DEFAULT_TIME_SLOTS.includes(slot as TimeSlot))));
      const block = blockedDates.find((item) => getDateRange(item.startDate, item.endDate).includes(dateKey));
      const availableSlots = block ? [] : DEFAULT_TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot));

      map.set(dateKey, {
        availableSlots,
        bookedSlots,
        isBlocked: Boolean(block),
        blockedReason: block?.reason,
      });
    });

  return map;
}

export function getCalendarDays({
  currentMonth,
  today,
  availabilityMap,
}: {
  currentMonth: Date;
  today: Date;
  availabilityMap: ReturnType<typeof buildAvailabilityMap>;
}): AvailabilityCalendarDay[] {
  const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startOffset = start.getDay();
  start.setDate(start.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = toDateKey(date);
    const availability = availabilityMap.get(dateKey) || {
      availableSlots: [...DEFAULT_TIME_SLOTS],
      bookedSlots: [],
      isBlocked: false,
      blockedReason: undefined,
    };
    const isPast = date < today;
    const inMonth = date.getMonth() === currentMonth.getMonth();

    return {
      dateKey,
      dayNumber: date.getDate(),
      inMonth,
      isPast,
      isBlocked: availability.isBlocked,
      blockedReason: availability.blockedReason,
      bookedSlots: availability.bookedSlots,
      availableSlots: availability.availableSlots,
      isAvailable: !isPast && !availability.isBlocked && availability.availableSlots.length > 0,
    };
  });
}

const MOCK_BLOCKED_DATES: Record<string, LocationAvailabilityBlock[]> = {
  '1': [
    { id: 'blk-1', startDate: '2026-03-24', endDate: '2026-03-24', reason: 'Deep cleaning + reset' },
    { id: 'blk-2', startDate: '2026-03-29', endDate: '2026-03-31', reason: 'Owner staying on-site' },
  ],
  '2': [
    { id: 'blk-3', startDate: '2026-03-27', endDate: '2026-03-28', reason: 'Pool maintenance' },
  ],
  'hillside-view-los-angeles': [
    { id: 'blk-4', startDate: '2026-03-26', endDate: '2026-03-28', reason: 'Private event hold' },
  ],
};

export function getLocationBlockedDates(locationId: string) {
  return MOCK_BLOCKED_DATES[locationId] || [];
}

export function getLocationAvailability(locationId: string) {
  const location = (locationsData as Location[]).find((item) => item.id === locationId);
  return {
    bookings: location?.bookings || [],
    blockedDates: getLocationBlockedDates(locationId),
  };
}
