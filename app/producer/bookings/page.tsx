"use client";

import { useEffect, useState } from 'react';
import { Calendar, MapPin, User, Mail, Phone, X, Check, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

type Booking = {
  id: string;
  locationId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  productionType: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  createdAt: string;
};

type Location = {
  id: string;
  name: string;
  city: string;
  state: string;
};

const tabs = ['All', 'Pending', 'Confirmed', 'Rejected'];

export default function ProducerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  // Demo producer identifier
  const producerName = 'Alex Morgan';

  useEffect(() => {
    async function fetchData() {
      try {
        const [bookingsRes, locationsRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/locations'),
        ]);
        const bookingsData = await bookingsRes.json();
        const locationsData = await locationsRes.json();

        // Filter bookings for this producer (by name for demo)
        const producerBookings = bookingsData.bookings.filter(
          (b: Booking) => b.name === producerName
        );

        setBookings(producerBookings);
        setLocations(locationsData.locations || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return booking.status === 'pending';
    if (activeTab === 'Confirmed') return booking.status === 'confirmed';
    if (activeTab === 'Rejected') return booking.status === 'rejected';
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <Check className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-900/30 text-green-400';
      case 'pending': return 'bg-yellow-900/30 text-yellow-400';
      case 'rejected': return 'bg-red-900/30 text-red-400';
      case 'cancelled': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-blue-500">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-blue-500">Manage your shoot bookings, view status, and contact location owners.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-blue-200">
        <div className="flex space-x-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 border-b-2 font-semibold transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-blue-500 hover:text-blue-700'
              }`}
            >
              {tab} {tab !== 'All' && `(${bookings.filter(b => b.status === tab.toLowerCase()).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings list */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-6">
          {filteredBookings.map(booking => {
            const location = locations.find(l => l.id === booking.locationId);
            return (
              <div key={booking.id} className="border border-slate-200 rounded-xl p-6 bg-white">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Left side: location info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">
                          {location ? location.name : `Location ${booking.locationId}`}
                        </h3>
                        <div className="flex items-center text-blue-500 mt-2">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{location ? `${location.city}, ${location.state}` : 'Unknown location'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Booking details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-blue-500">Date</p>
                        <p className="font-semibold">{booking.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-500">Time</p>
                        <p className="font-semibold">{booking.startTime} – {booking.endTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-500">Production Type</p>
                        <p className="font-semibold">{booking.productionType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-500">Booking ID</p>
                        <p className="font-mono text-sm text-blue-500">{booking.id}</p>
                      </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="mb-6">
                        <p className="text-sm text-blue-500">Notes</p>
                        <p className="text-slate-700">{booking.notes}</p>
                      </div>
                    )}

                    {/* Contact info */}
                    <div className="border-t border-slate-200 pt-6">
                      <p className="text-sm text-slate-500 mb-3">Location Owner Contact</p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-900">Jane Doe (Owner)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <a href="mailto:owner@example.com" className="text-blue-600 hover:underline">
                            owner@example.com
                          </a>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-700">Owner phone shared after booking confirmation if provided</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side: actions */}
                  <div className="lg:w-48 space-y-4">
                    <Link
                      href={`/locations/${booking.locationId}`}
                      className="w-full py-2 rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>View Location</span>
                    </Link>
                    <button className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Message Owner</span>
                    </button>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="w-full py-2 rounded-lg border border-red-700 text-red-400 hover:bg-red-900/30 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">📅</div>
          <h3 className="text-2xl font-bold mb-2">No bookings found</h3>
          <p className="text-blue-500">
            {activeTab === 'All'
              ? "You haven't made any bookings yet."
              : `You don't have any ${activeTab.toLowerCase()} bookings.`}
          </p>
          <Link
            href="/producer/search"
            className="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            Search Locations
          </Link>
        </div>
      )}
    </div>
  );
}