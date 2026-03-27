'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Star } from 'lucide-react';
import { Location } from '@/types/location';
import { getLocationCoordinates } from '@/lib/location-map-data';

interface LocationsMapViewProps {
  locations: Location[];
}

function formatPropertyType(propertyType: string) {
  return propertyType
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildStaticMapUrl(lat: number, lng: number) {
  const left = lng - 0.018;
  const right = lng + 0.018;
  const top = lat + 0.012;
  const bottom = lat - 0.012;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export default function LocationsMapView({ locations }: LocationsMapViewProps) {
  const [selectedLocationId, setSelectedLocationId] = useState(locations[0]?.id ?? '');
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());

  useEffect(() => {
    if (!locations.some((location) => location.id === selectedLocationId)) {
      setSelectedLocationId(locations[0]?.id ?? '');
    }
  }, [locations, selectedLocationId]);

  const mappedLocations = useMemo(
    () =>
      locations.map((location) => ({
        location,
        coordinates: getLocationCoordinates(location),
      })),
    [locations],
  );

  const selectedItem = mappedLocations.find(({ location }) => location.id === selectedLocationId) || mappedLocations[0];

  useEffect(() => {
    if (!mapContainerRef.current || !mappedLocations.length) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markersRef.current.clear();
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    });

    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mappedLocations.forEach(({ location, coordinates }) => {
      const marker = L.circleMarker([coordinates.lat, coordinates.lng], {
        radius: 10,
        color: '#ffffff',
        weight: 3,
        fillColor: '#3B82F6',
        fillOpacity: 1,
      }).addTo(map);

      marker.bindTooltip(location.name, {
        direction: 'top',
        offset: [0, -12],
      });
      marker.on('click', () => setSelectedLocationId(location.id));
      markersRef.current.set(location.id, marker);
    });

    if (mappedLocations.length === 1) {
      const { coordinates } = mappedLocations[0];
      map.setView([coordinates.lat, coordinates.lng], 11);
    } else {
      const bounds = L.latLngBounds(mappedLocations.map(({ coordinates }) => [coordinates.lat, coordinates.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [36, 36] });
    }

    return () => {
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [mappedLocations]);

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const isActive = id === selectedItem?.location.id;
      marker.setStyle({
        radius: isActive ? 12 : 10,
        fillColor: '#3B82F6',
        color: isActive ? '#1D4ED8' : '#ffffff',
        weight: isActive ? 4 : 3,
      });
    });

    if (!selectedItem || !mapRef.current) return;

    const { lat, lng } = selectedItem.coordinates;
    mapRef.current.flyTo([lat, lng], Math.max(mapRef.current.getZoom(), 10), {
      duration: 0.5,
    });

    const marker = markersRef.current.get(selectedItem.location.id);
    marker?.openTooltip();
  }, [selectedItem]);

  if (!mappedLocations.length) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_360px]">
      <div className="overflow-hidden rounded-[30px] border border-black bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Map view</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-black">Browse visible properties by area</h2>
          </div>
          <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
            {mappedLocations.length} marker{mappedLocations.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="relative h-[520px] w-full bg-[#EFF6FF]">
          <div ref={mapContainerRef} className="h-full w-full" aria-label="Locations map" />
        </div>
      </div>

      <aside className="rounded-[30px] border border-black bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/45">Selected property</p>
        {selectedItem ? (
          <div className="mt-4 space-y-4">
            <div className="relative h-48 overflow-hidden rounded-[24px] border border-black/10 bg-[#FAFAFA]">
              <Image
                src={selectedItem.location.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80'}
                alt={selectedItem.location.name}
                fill
                sizes="360px"
                className="object-cover"
              />
            </div>

            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-semibold tracking-[-0.04em] text-black">{selectedItem.location.name}</h3>
                <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-[#FAFAFA] px-3 py-1 text-sm font-semibold text-black">
                  <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
                  {(selectedItem.location.reviewRating || 4.8).toFixed(1)}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-black/65">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>{selectedItem.coordinates.areaLabel} · {selectedItem.location.city}, {selectedItem.location.state}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-blue-500 bg-white px-3 py-1 text-sm font-medium text-blue-600">
                {formatPropertyType(selectedItem.location.propertyType)}
              </span>
              <span className="rounded-full border border-black/10 bg-[#FAFAFA] px-3 py-1 text-sm text-black/70">
                {selectedItem.location.style}
              </span>
              <span className="rounded-full border border-black/10 bg-[#FAFAFA] px-3 py-1 text-sm text-black/70">
                ${selectedItem.location.pricePerHour}/hour
              </span>
            </div>

            <p className="text-sm leading-6 text-black/72">{selectedItem.location.description}</p>

            <div className="grid grid-cols-2 gap-3 text-sm text-black/70">
              <div className="rounded-2xl border border-black/10 bg-[#FAFAFA] px-4 py-3">
                <p className="text-black/50">Capacity</p>
                <p className="mt-1 font-semibold text-black">{selectedItem.location.maxGuests || selectedItem.location.maxCapacity || 8} guests</p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-[#FAFAFA] px-4 py-3">
                <p className="text-black/50">Minimum</p>
                <p className="mt-1 font-semibold text-black">{selectedItem.location.minimumBookingHours || 3} hour minimum</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={`/locations/${selectedItem.location.id}`}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                View Details
              </a>
              <iframe
                title={`${selectedItem.location.name} area map preview`}
                src={buildStaticMapUrl(selectedItem.coordinates.lat, selectedItem.coordinates.lng)}
                className="h-28 w-full rounded-[20px] border border-black/10"
                loading="lazy"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">Visible properties</p>
              <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto pr-1">
                {mappedLocations.map(({ location, coordinates }) => {
                  const isActive = location.id === selectedItem.location.id;
                  return (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => setSelectedLocationId(location.id)}
                      className={`w-full rounded-[22px] border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 shadow-[0_12px_30px_rgba(59,130,246,0.12)]'
                          : 'border-black/10 bg-white hover:border-blue-300 hover:bg-blue-50/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-black">{location.name}</p>
                          <p className="mt-1 text-sm text-black/60">{coordinates.areaLabel} · {location.city}</p>
                        </div>
                        <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-black/70">
                          ${location.pricePerHour}/hr
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
