"use client";

import { useEffect, useMemo, useRef, useState } from 'react';

type AreaMapProps = {
  city: string;
  state: string;
  neighborhood?: string;
  privacyNotice?: string;
  compact?: boolean;
};

type Coordinates = {
  lat: number;
  lon: number;
};

const DEFAULT_CENTER: Coordinates = {
  lat: 34.0522,
  lon: -118.2437,
};

export default function AreaMap({ city, state, neighborhood, privacyNotice, compact = false }: AreaMapProps) {
  const [center, setCenter] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  const areaLabel = useMemo(() => {
    const detail = neighborhood ? neighborhood.split('-')[0].trim() : city;
    return detail || `${city}, ${state}`;
  }, [city, neighborhood, state]);

  useEffect(() => {
    let cancelled = false;

    const geocode = async () => {
      try {
        setStatus('loading');
        const query = encodeURIComponent(`${city}, ${state}`);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Geocoding failed');
        }

        const results = (await response.json()) as Array<{ lat: string; lon: string }>;
        const match = results[0];

        if (!match) {
          throw new Error('No coordinates found');
        }

        if (!cancelled) {
          setCenter({ lat: Number(match.lat), lon: Number(match.lon) });
          setStatus('ready');
        }
      } catch {
        if (!cancelled) {
          setCenter(DEFAULT_CENTER);
          setStatus('error');
        }
      }
    };

    void geocode();

    return () => {
      cancelled = true;
    };
  }, [city, state]);

  useEffect(() => {
    if (!mapElementRef.current || !center) {
      return;
    }

    let disposed = false;

    const initMap = async () => {
      const leafletModule = await import('leaflet');
      const L: any = leafletModule.default ?? leafletModule;

      if (disposed || !mapElementRef.current) {
        return;
      }

      const latLng: [number, number] = [center.lat, center.lon];

      if (!mapInstanceRef.current) {
        const map = L.map(mapElementRef.current, {
          zoomControl: true,
          scrollWheelZoom: false,
          dragging: true,
        }).setView(latLng, 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        circleRef.current = L.circle(latLng, {
          radius: 2200,
          color: '#facc15',
          fillColor: '#facc15',
          fillOpacity: 0.18,
          weight: 2,
        }).addTo(map);

        mapInstanceRef.current = map;
        return;
      }

      mapInstanceRef.current.setView(latLng, 12);
      circleRef.current?.setLatLng(latLng);
    };

    void initMap();

    return () => {
      disposed = true;
    };
  }, [center]);

  useEffect(() => {
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      circleRef.current = null;
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-200 bg-black/90">
      <div className="flex items-center justify-between border-b border-blue-200 bg-black px-4 py-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">Approximate location</p>
          <p className="text-sm text-blue-500">Centered on the general area around {areaLabel}, not the exact property address.</p>
        </div>
        <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-200">
          Privacy protected
        </span>
      </div>

      <div className="relative">
        <div className={`absolute left-4 top-4 z-[500] rounded-xl border border-blue-200 bg-black/75 text-white shadow-lg backdrop-blur-sm ${compact ? 'max-w-[16rem] px-3 py-2 text-xs' : 'max-w-sm px-4 py-3 text-sm'}`}>
          Exact location provided after booking.
        </div>
        <div ref={mapElementRef} className={`${compact ? 'h-[240px]' : 'h-[360px]'} w-full`} />
      </div>

      <div className="border-t border-blue-200 px-4 py-3 text-sm text-blue-500">
        {privacyNotice || 'Exact location provided after booking confirmation.'}
        {status === 'loading' && <span className="ml-2 text-blue-500">Loading area map…</span>}
        {status === 'error' && <span className="ml-2 text-blue-500">Showing fallback area view.</span>}
      </div>
    </div>
  );
}
