"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, MapPin, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Booking, Location } from "@/types";

type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function BookingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter && ['all', 'pending', 'confirmed', 'rejected', 'cancelled'].includes(filter)) {
      setActiveTab(filter);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, locationsRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/locations'),
        ]);
        const bookingsData = await bookingsRes.json();
        const locationsData = await locationsRes.json();
        setBookings(bookingsData.bookings || []);
        setLocations(locationsData || []);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBookings = activeTab === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === activeTab);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
      } else {
        console.error('Failed to approve booking');
      }
    } catch (error) {
      console.error('Failed to approve booking', error);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected' } : b));
      } else {
        console.error('Failed to reject booking');
      }
    } catch (error) {
      console.error('Failed to reject booking', error);
    }
  };

  const getLocationTitle = (locationId: string) => {
    const loc = locations.find(l => l.id === locationId);
    return loc?.title || 'Unknown Location';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (start: string, end: string) => {
    return `${start} – ${end}`;
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', tabId);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const getTabCount = (tabId: string) => {
    if (tabId === 'all') return bookings.length;
    return bookings.filter(b => b.status === tabId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3">Loading bookings...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Booking Requests</h1>
        <p className="text-blue-500">Review and manage incoming booking requests</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-blue-200 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-blue-500 hover:text-blue-700'}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label} {getTabCount(tab.id) > 0 && <span className="ml-2 bg-blue-100 text-white text-xs px-2 py-1 rounded-full">{getTabCount(tab.id)}</span>}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBookings.map(booking => (
          <Card key={booking.id}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{getLocationTitle(booking.locationId)}</CardTitle>
                  <p className="text-sm text-blue-500">Requested by {booking.name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'confirmed' ? 'bg-green-900/30 text-green-300' :
                  booking.status === 'pending' ? 'bg-yellow-900/30 text-yellow-300' :
                  booking.status === 'rejected' ? 'bg-red-900/30 text-red-300' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {booking.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{booking.name}</p>
                    <p className="text-xs text-blue-500">{booking.email}</p>
                    <p className="text-xs text-blue-500">{booking.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{formatDate(booking.date)}</p>
                    <p className="text-xs text-blue-500">{formatTime(booking.startTime, booking.endTime)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{booking.productionType}</p>
                  <p className="text-xs text-blue-500">Production type</p>
                </div>
              </div>
              {booking.notes && (
                <div>
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="rounded p-3 text-sm text-black/70 bg-blue-50">{booking.notes}</p>
                </div>
              )}
              {booking.status === 'pending' && (
                <div className="flex space-x-3 pt-2">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(booking.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDecline(booking.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </div>
              )}
              {booking.status !== 'pending' && (
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
            <Clock className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
          <p className="text-blue-500">No booking requests match the selected filter.</p>
        </div>
      )}
    </div>
  );
}