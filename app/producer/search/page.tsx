"use client";

import { useEffect, useState } from 'react';
import { MapPin, DollarSign, Shield, Heart, Calendar } from 'lucide-react';
import Link from 'next/link';

type Location = {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  description: string;
  pricePerHour: number;
  privacyTier?: 'Private' | 'Public' | 'NDA Required';
  propertyType: string;
  contentTypes?: string[];
  amenities: string[];
  images: string[];
};

type Favorite = {
  id: string;
  locationId: string;
};

const propertyTypes = ['House', 'Apartment', 'Studio', 'Warehouse', 'Cabin', 'Penthouse'];
const privacyTiers = ['Private', 'Public', 'NDA Required'];
const amenitiesList = ['Parking', 'WiFi', 'Lighting', 'Changing Room', 'Shower', 'Kitchen', 'Pool', 'Makeup Station', 'Loading Dock', 'Fireplace', 'Outdoor Shower'];
const contentTypesList = ['Photo shoot', 'Video production', 'Commercial', 'Lifestyle', 'Editorial'];

export default function ProducerSearchPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    propertyType: '',
    privacyTier: '',
    amenities: '',
    contentTypes: '',
    search: '',
  });

  // Fetch locations and favorites
  useEffect(() => {
    async function fetchData() {
      try {
        const [locRes, favRes] = await Promise.all([
          fetch('/api/locations'),
          fetch('/api/favorites?producerId=producer_001'),
        ]);
        const locData = await locRes.json();
        const favData = await favRes.json();
        setLocations(locData.locations || []);
        setFavorites(favData.favorites || []);
        setFilteredLocations(locData.locations || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...locations];
    if (filters.propertyType && filters.propertyType !== 'Property Type') {
      filtered = filtered.filter(loc => loc.propertyType === filters.propertyType.toLowerCase());
    }
    if (filters.privacyTier && filters.privacyTier !== 'Privacy Tier') {
      filtered = filtered.filter(loc => loc.privacyTier === filters.privacyTier);
    }
    if (filters.amenities && filters.amenities !== 'Amenities') {
      filtered = filtered.filter(loc => loc.amenities.includes(filters.amenities.toLowerCase()));
    }
    if (filters.contentTypes && filters.contentTypes !== 'Content Types') {
      filtered = filtered.filter(loc => loc.amenities.includes(filters.contentTypes));
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(loc =>
        loc.city.toLowerCase().includes(searchLower) ||
        loc.state.toLowerCase().includes(searchLower) ||
        loc.address.toLowerCase().includes(searchLower) ||
        loc.name.toLowerCase().includes(searchLower)
      );
    }
    setFilteredLocations(filtered);
  }, [filters, locations]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      propertyType: '',
      privacyTier: '',
      amenities: '',
      contentTypes: '',
      search: '',
    });
  };

  const toggleFavorite = async (locationId: string) => {
    const isFavorited = favorites.some(fav => fav.locationId === locationId);
    try {
      if (isFavorited) {
        await fetch(`/api/favorites?producerId=producer_001&locationId=${locationId}`, { method: 'DELETE' });
        setFavorites(prev => prev.filter(fav => fav.locationId !== locationId));
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ producerId: 'producer_001', locationId }),
        });
        if (res.ok) {
          const data = await res.json();
          setFavorites(prev => [...prev, data.favorite]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-blue-500">Loading locations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Search Locations</h1>
        <p className="text-blue-500">Filter by property type, privacy, amenities, and allowed content.</p>
      </div>

      {/* Filters */}
      <div className="p-6 rounded-xl bg-white border border-slate-200">
        <h2 className="text-xl font-semibold mb-4 text-slate-900">Filters</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <select
            value={filters.propertyType}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900"
          >
            <option value="">Property Type</option>
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={filters.privacyTier}
            onChange={(e) => handleFilterChange('privacyTier', e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900"
          >
            <option value="">Privacy Tier</option>
            {privacyTiers.map(tier => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>
          <select
            value={filters.amenities}
            onChange={(e) => handleFilterChange('amenities', e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900"
          >
            <option value="">Amenities</option>
            {amenitiesList.map(amenity => (
              <option key={amenity} value={amenity}>{amenity}</option>
            ))}
          </select>
          <select
            value={filters.contentTypes}
            onChange={(e) => handleFilterChange('contentTypes', e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900"
          >
            <option value="">Content Types</option>
            {contentTypesList.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="City, State, Address, Title"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 col-span-2 text-slate-900"
          />
        </div>
        <div className="flex justify-between items-center mt-6">
          <div className="text-slate-500">
            Showing {filteredLocations.length} of {locations.length} locations
          </div>
          <div className="flex gap-3">
            <button
              onClick={clearFilters}
              className="px-5 py-2 border border-slate-200 bg-white text-slate-900 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-lg font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Location grid */}
      {filteredLocations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLocations.map((location) => {
            const isFavorited = favorites.some(fav => fav.locationId === location.id);
            const privacyColorMap = {
              'Private': 'bg-green-900/30 text-green-400',
              'Public': 'bg-yellow-900/30 text-yellow-400',
              'NDA Required': 'bg-red-900/30 text-red-400',
            } as const;
            const privacyColor = location.privacyTier ? privacyColorMap[location.privacyTier] : '';

            return (
              <div key={location.id} className="rounded-xl overflow-hidden border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-r from-blue-900/20 to-white flex items-center justify-center">
                  <div className="text-blue-500 text-6xl">📸</div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold">{location.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${privacyColor}`}>
                      {location.privacyTier}
                    </span>
                  </div>

                  <div className="flex items-center text-blue-500 mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{location.city}, {location.state}</span>
                  </div>

                  <p className="text-slate-700 mb-6 line-clamp-2">{location.description}</p>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-400 mr-1" />
                      <span className="text-2xl font-bold">${location.pricePerHour}</span>
                      <span className="text-blue-500 ml-1">/hour</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center mb-3">
                      <Shield className="w-4 h-4 mr-2 text-slate-500" />
                      <span className="text-sm text-slate-500">Content types allowed:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(location.contentTypes || []).map((type) => (
                        <span key={type} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {location.amenities.slice(0, 3).map((amenity) => (
                      <span key={amenity} className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700">
                        {amenity}
                      </span>
                    ))}
                    {location.amenities.length > 3 && (
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700">
                        +{location.amenities.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => toggleFavorite(location.id)}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 ${
                        isFavorited
                          ? 'bg-pink-600 hover:bg-pink-700 text-white'
                          : 'border border-slate-200 bg-white text-slate-900 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
                      <span>{isFavorited ? 'Remove Favorite' : 'Add to Favorites'}</span>
                    </button>
                    <Link
                      href={`/locations/${location.id}`}
                      className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Request Booking</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🏜️</div>
          <h3 className="text-2xl font-bold mb-2">No locations match your filters</h3>
          <p className="text-blue-500">Try adjusting your criteria or clear filters</p>
        </div>
      )}
    </div>
  );
}