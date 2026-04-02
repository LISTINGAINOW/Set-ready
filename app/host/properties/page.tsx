'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Edit2, Eye, EyeOff, ImageIcon, ArrowRight } from 'lucide-react';

interface Property {
  id: string;
  property_name: string;
  city: string;
  state: string;
  status: string;
  images: string[];
  price_per_hour: number;
  price_per_day: number;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

function StatusBadge({ status, approved }: { status: string; approved: boolean }) {
  if (approved && status === 'active') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Live
      </span>
    );
  }
  if (status === 'hidden') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 border border-slate-200">
        <EyeOff className="h-3 w-3" />
        Hidden
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
      Pending review
    </span>
  );
}

export default function HostPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/host/properties', { credentials: 'include' });
        if (res.status === 401) {
          router.push('/host/login');
          return;
        }
        const json = await res.json();
        if (json.error) setError(json.error);
        else setProperties(json.properties ?? []);
      } catch {
        setError('Failed to load properties.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-12">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Host Portal</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">My Properties</h1>
        <p className="mt-2 text-sm text-slate-500">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'} in your portfolio
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {properties.length === 0 && !error ? (
        <div className="text-center py-20">
          <Building2 className="h-14 w-14 text-slate-200 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-700 mb-2">No properties yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Your properties will appear here once they've been added to SetVenue. Contact us if you're ready to list.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 hover:border-emerald-200 hover:shadow-sm transition"
            >
              {/* Thumbnail */}
              <div className="h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
                {prop.images?.[0] ? (
                  <img
                    src={prop.images[0]}
                    alt={prop.property_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon className="h-7 w-7 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {prop.property_name || 'Untitled property'}
                  </h3>
                  <StatusBadge status={prop.status} approved={prop.approved} />
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  {[prop.city, prop.state].filter(Boolean).join(', ')}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  {prop.price_per_hour && (
                    <span>${prop.price_per_hour}/hr</span>
                  )}
                  {prop.price_per_day && (
                    <span>${prop.price_per_day}/day</span>
                  )}
                  <span>{prop.images?.length ?? 0} photo{(prop.images?.length ?? 0) !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/host/properties/${prop.id}`}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
