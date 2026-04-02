'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, MessageSquare, DollarSign, Clock, ArrowRight, TrendingUp } from 'lucide-react';

interface DashboardData {
  totalProperties: number;
  activeProperties: number;
  pendingInquiries: number;
  totalInquiries: number;
  recentProperties: Array<{
    id: string;
    property_name: string;
    city: string;
    state: string;
    status: string;
    images: string[];
    price_per_hour: number;
  }>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color} mb-4`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function HostDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [propRes, inqRes] = await Promise.all([
          fetch('/api/host/properties', { credentials: 'include' }),
          fetch('/api/host/inquiries', { credentials: 'include' }),
        ]);

        if (propRes.status === 401) {
          router.push('/host/login');
          return;
        }

        const propJson = await propRes.json();
        const inqJson = inqRes.ok ? await inqRes.json() : { inquiries: [] };

        const properties = propJson.properties ?? [];
        const inquiries = inqJson.inquiries ?? [];

        setData({
          totalProperties: properties.length,
          activeProperties: properties.filter((p: { status: string }) => p.status === 'active').length,
          pendingInquiries: inquiries.filter((i: { status: string }) => i.status === 'new').length,
          totalInquiries: inquiries.length,
          recentProperties: properties.slice(0, 4),
        });
      } catch {
        setError('Failed to load dashboard data.');
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

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Host Portal</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">Welcome back. Here's an overview of your properties.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={Building2}
          label="Total Properties"
          value={data.totalProperties}
          sub={`${data.activeProperties} active`}
          color="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Listings"
          value={data.activeProperties}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={MessageSquare}
          label="New Inquiries"
          value={data.pendingInquiries}
          sub={`${data.totalInquiries} total`}
          color="bg-amber-50 text-amber-700"
        />
        <StatCard
          icon={Clock}
          label="Total Inquiries"
          value={data.totalInquiries}
          color="bg-purple-50 text-purple-700"
        />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <Link
          href="/host/properties"
          className="flex items-center justify-between p-5 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition group"
        >
          <div>
            <p className="font-semibold">Manage Properties</p>
            <p className="text-sm text-emerald-200 mt-0.5">Edit listings, update photos</p>
          </div>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/host/inquiries"
          className="flex items-center justify-between p-5 rounded-2xl bg-slate-800 text-white hover:bg-slate-900 transition group"
        >
          <div>
            <p className="font-semibold">View Inquiries</p>
            <p className="text-sm text-slate-400 mt-0.5">
              {data.pendingInquiries > 0 ? `${data.pendingInquiries} new inquiry${data.pendingInquiries !== 1 ? 'ies' : ''}` : 'No new inquiries'}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Recent properties */}
      {data.recentProperties.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Your Properties</h2>
            <Link href="/host/properties" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.recentProperties.map((prop) => (
              <Link
                key={prop.id}
                href={`/host/properties/${prop.id}`}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition group"
              >
                {/* Thumbnail */}
                <div className="h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
                  {prop.images?.[0] ? (
                    <img src={prop.images[0]} alt={prop.property_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition">
                    {prop.property_name || 'Untitled property'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {prop.city}{prop.city && prop.state ? ', ' : ''}{prop.state}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      prop.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {prop.status || 'draft'}
                    </span>
                    {prop.price_per_hour && (
                      <span className="text-xs text-slate-400">${prop.price_per_hour}/hr</span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition flex-shrink-0 self-center" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {data.totalProperties === 0 && (
        <div className="text-center py-16">
          <Building2 className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-700 mb-2">No properties yet</h3>
          <p className="text-sm text-slate-400">
            Your properties will appear here once they're added to SetVenue.
          </p>
        </div>
      )}
    </div>
  );
}
