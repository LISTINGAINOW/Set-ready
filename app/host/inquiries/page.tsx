'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Phone, Mail, Building2, Calendar } from 'lucide-react';

interface Inquiry {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  production_type?: string;
  dates_needed?: string;
  budget_range?: string;
  crew_size?: string;
  status: string;
  created_at: string;
  property_id?: string;
  property_name?: string;
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  booked: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  declined: 'bg-red-50 text-red-700 border-red-200',
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status?: string }) {
  const s = status || 'new';
  const styles = STATUS_STYLES[s] ?? 'bg-slate-50 text-slate-700 border-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}>
      {s}
    </span>
  );
}

function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div
        className="flex items-start gap-4 p-5 cursor-pointer hover:bg-slate-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold text-sm">
          {inquiry.name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-semibold text-slate-900">{inquiry.name || 'Unknown'}</p>
              {inquiry.company && (
                <p className="text-sm text-slate-500">{inquiry.company}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={inquiry.status} />
              <span className="text-xs text-slate-400">{formatDate(inquiry.created_at)}</span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {inquiry.property_name && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {inquiry.property_name}
              </span>
            )}
            {inquiry.production_type && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {inquiry.production_type}
              </span>
            )}
            {inquiry.dates_needed && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {inquiry.dates_needed}
              </span>
            )}
          </div>

          {inquiry.message && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">{inquiry.message}</p>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Contact info */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Contact Info
              </h4>
              <div className="space-y-2">
                <a
                  href={`mailto:${inquiry.email}`}
                  className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {inquiry.email}
                </a>
                {inquiry.phone && (
                  <a
                    href={`tel:${inquiry.phone}`}
                    className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {inquiry.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Production details */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Production Details
              </h4>
              <dl className="space-y-1.5 text-sm text-slate-600">
                {inquiry.production_type && (
                  <div className="flex gap-2">
                    <dt className="text-slate-400 min-w-20">Type:</dt>
                    <dd>{inquiry.production_type}</dd>
                  </div>
                )}
                {inquiry.dates_needed && (
                  <div className="flex gap-2">
                    <dt className="text-slate-400 min-w-20">Dates:</dt>
                    <dd>{inquiry.dates_needed}</dd>
                  </div>
                )}
                {inquiry.crew_size && (
                  <div className="flex gap-2">
                    <dt className="text-slate-400 min-w-20">Crew size:</dt>
                    <dd>{inquiry.crew_size}</dd>
                  </div>
                )}
                {inquiry.budget_range && (
                  <div className="flex gap-2">
                    <dt className="text-slate-400 min-w-20">Budget:</dt>
                    <dd>{inquiry.budget_range}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {inquiry.message && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                Message
              </h4>
              <p className="text-sm text-slate-700 bg-white rounded-xl border border-slate-200 px-4 py-3">
                {inquiry.message}
              </p>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <a
              href={`mailto:${inquiry.email}?subject=Re: Your SetVenue Inquiry`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              <Mail className="h-3.5 w-3.5" />
              Reply via email
            </a>
            {inquiry.phone && (
              <a
                href={`tel:${inquiry.phone}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HostInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/host/inquiries', { credentials: 'include' });
        if (res.status === 401) { router.push('/host/login'); return; }
        const json = await res.json();
        if (json.error) setError(json.error);
        else setInquiries(json.inquiries ?? []);
      } catch {
        setError('Failed to load inquiries.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const filtered = filter === 'all'
    ? inquiries
    : inquiries.filter((i) => i.status === filter);

  const newCount = inquiries.filter((i) => i.status === 'new').length;

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
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Inquiries</h1>
        <p className="mt-2 text-sm text-slate-500">
          {inquiries.length} total {inquiries.length === 1 ? 'inquiry' : 'inquiries'}
          {newCount > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {newCount} new
            </span>
          )}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Filter tabs */}
      {inquiries.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'new', 'contacted', 'booked', 'declined'].map((s) => {
            const count = s === 'all' ? inquiries.length : inquiries.filter((i) => i.status === s).length;
            if (s !== 'all' && count === 0) return null;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition capitalize ${
                  filter === s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
                }`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && !error ? (
        <div className="text-center py-20">
          <MessageSquare className="h-14 w-14 text-slate-200 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-700 mb-2">
            {filter === 'all' ? 'No inquiries yet' : `No ${filter} inquiries`}
          </h3>
          <p className="text-sm text-slate-400">
            {filter === 'all'
              ? 'Inquiries from production companies will appear here.'
              : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inquiry) => (
            <InquiryCard key={inquiry.id} inquiry={inquiry} />
          ))}
        </div>
      )}
    </div>
  );
}
