"use client";

import { useEffect, useState } from 'react';
import { Heart, MapPin, DollarSign, Shield, Calendar, Trash2 } from 'lucide-react';
import Link from 'next/link';

type Location = {
  id: string;
  name: string;
  city: string;
  state: string;
  description: string;
  pricePerHour: number;
  style: string;
  propertyType: string;
  amenities: string[];
};

type Favorite = {
  id: string;
  locationId: string;
};

export default function ProducerFavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [favRes, locRes] = await Promise.all([
          fetch('/api/favorites?producerId=producer_001'),
          fetch('/api/locations'),
        ]);
        const favData = await favRes.json();
        const locData = await locRes.json();
        setFavorites(favData.favorites || []);
        setLocations(locData.locations || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const favoriteLocations = locations.filter(loc =>
    favorites.some(fav => fav.locationId === loc.id)
  );

  const removeFavorite = async (locationId: string) => {
    try {
      await fetch(`/api/favorites?producerId=producer_001&locationId=${locationId}`, {
        method: 'DELETE',
      });
      setFavorites(prev => prev.filter(fav => fav.locationId !== locationId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-blue-500">Loading favorites...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Favorite Locations</h1>
        <p className="text-blue-500">Your saved locations for quick booking.</p>
      </div>

      {favoriteLocations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoriteLocations.map(location => {
            return (
              <div key={location.id} className="rounded-xl overflow-hidden border border-blue-200 bg-black/80 hover:bg-black transition-colors">
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-r from-blue-900/20 to-white flex items-center justify-center">
                  <div className="text-blue-500 text-6xl">📸</div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold">{location.name}</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {location.style}
                    </span>
                  </div>

                  <div className="flex items-center text-blue-500 mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{location.city}, {location.state}</span>
                  </div>

                  <p className="text-white mb-6 line-clamp-2">{location.description}</p>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-400 mr-1" />
                      <span className="text-2xl font-bold">${location.pricePerHour}</span>
                      <span className="text-blue-500 ml-1">/hour</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-blue-200">
                    <div className="flex items-center mb-3">
                      <Shield className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-sm text-blue-500">Amenities:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {location.amenities.slice(0, 3).map(type => (
                        <span key={type} className="px-3 py-1 bg-black rounded-full text-sm">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {location.amenities.slice(0, 3).map(amenity => (
                      <span key={amenity} className="px-3 py-1 bg-black/85 rounded-full text-sm text-blue-500">
                        {amenity}
                      </span>
                    ))}
                    {location.amenities.length > 3 && (
                      <span className="px-3 py-1 bg-black/85 rounded-full text-sm text-blue-500">
                        +{location.amenities.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => removeFavorite(location.id)}
                      className="flex-1 py-2 rounded-lg border border-red-700 text-red-400 hover:bg-red-900/30 flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
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
          <div className="text-6xl mb-6">❤️</div>
          <h3 className="text-2xl font-bold mb-2">No favorites yet</h3>
          <p className="text-blue-500">Save locations you like to easily find them later.</p>
          <Link
            href="/producer/search"
            className="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            Browse Locations
          </Link>
        </div>
      )}
    </div>
  );
}