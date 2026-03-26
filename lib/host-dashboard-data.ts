import bookingsData from '@/data/bookings.json';
import locationsData from '@/data/locations.json';
import type { Booking, Location } from '@/types';

export type HostListing = Omit<Location, 'views'> & {
  active: boolean;
  views: number;
  lastUpdated: string;
};

export type HostBooking = Booking & {
  payout: number;
  guestCount: number;
  requestAge: string;
};

export interface HostProfile {
  name: string;
  email: string;
  phone: string;
  responseRate: string;
  responseTime: string;
  verificationStatus: 'Verified' | 'Pending';
  payoutMethod: string;
  payoutSchedule: string;
}

const ACTIVE_LISTING_IDS = new Set(['1', '2', '3', '4', '6', '8', 'hillside-view-los-angeles']);
const HOST_CUT = 0.9;

function getBookingHours(startTime: string, endTime: string) {
  const start = Number.parseInt(startTime.split(':')[0] || '0', 10);
  const end = Number.parseInt(endTime.split(':')[0] || '0', 10);
  return Math.max(end - start, 1);
}

export function getHostListings(): HostListing[] {
  const source = (locationsData as Location[]).slice(0, 7);

  return source.map((location, index) => ({
    ...location,
    active: ACTIVE_LISTING_IDS.has(location.id),
    views: 140 + index * 37,
    lastUpdated: `2026-03-${String(21 - index).padStart(2, '0')}`,
  }));
}

export function getHostBookings(): HostBooking[] {
  const listingMap = new Map(getHostListings().map((listing) => [listing.id, listing]));

  return ((bookingsData.bookings || []) as Booking[])
    .filter((booking) => listingMap.has(booking.locationId))
    .map((booking, index) => {
      const listing = listingMap.get(booking.locationId)!;
      const hours = getBookingHours(booking.startTime, booking.endTime);
      return {
        ...booking,
        payout: listing.pricePerHour * hours * HOST_CUT,
        guestCount: 2 + (index % 5),
        requestAge: `${1 + index}d ago`,
      };
    });
}

export function getHostProfile(): HostProfile {
  return {
    name: 'Jessica Carter',
    email: 'host@setvenue.com',
    phone: '(310) 555-0142',
    responseRate: '98%',
    responseTime: 'under 1 hour',
    verificationStatus: 'Verified',
    payoutMethod: 'Bank transfer ending in 2841',
    payoutSchedule: 'Weekly payouts every Friday',
  };
}

export function getHostMetrics() {
  const listings = getHostListings();
  const bookings = getHostBookings();
  const activeListings = listings.filter((listing) => listing.active).length;
  const pendingBookings = bookings.filter((booking) => booking.status === 'pending').length;
  const acceptedBookings = bookings.filter((booking) => booking.status === 'confirmed');
  const monthlyRevenue = acceptedBookings.reduce((sum, booking) => sum + booking.payout, 0);
  const pendingPayouts = bookings
    .filter((booking) => booking.status === 'confirmed' || booking.status === 'pending')
    .reduce((sum, booking) => sum + booking.payout, 0);

  return {
    totalListings: listings.length,
    activeListings,
    pendingBookings,
    monthlyRevenue,
    pendingPayouts,
    occupancyRate: Math.round((acceptedBookings.length / Math.max(listings.length * 2, 1)) * 100),
  };
}

export function getCalendarRows() {
  return [
    { date: 'Mar 24', morning: 'Available', afternoon: 'Booked', evening: 'Booked' },
    { date: 'Mar 25', morning: 'Pending', afternoon: 'Pending', evening: 'Available' },
    { date: 'Mar 26', morning: 'Booked', afternoon: 'Available', evening: 'Available' },
    { date: 'Mar 27', morning: 'Booked', afternoon: 'Booked', evening: 'Pending' },
    { date: 'Mar 28', morning: 'Available', afternoon: 'Available', evening: 'Booked' },
  ];
}
