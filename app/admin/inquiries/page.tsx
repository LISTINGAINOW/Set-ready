import { createAdminClient } from '@/utils/supabase/admin';

interface Inquiry {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  company_name?: string;
  property_id?: string;
  production_type?: string;
  dates_needed?: string;
  duration?: string;
  crew_size?: string;
  budget_range?: string;
  status?: string;
  source?: string;
  created_at?: string;
  hear_about_us?: string;
  admin_notes?: string;
  contacted_at?: string;
  booked_at?: string;
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  booked: 'bg-green-50 text-green-700 border-green-200',
  declined: 'bg-red-50 text-red-700 border-red-200',
};

function StatusBadge({ status }: { status?: string }) {
  const s = status || 'new';
  const styles = STATUS_STYLES[s] ?? 'bg-slate-50 text-slate-700 border-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}>
      {s}
    </span>
  );
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function AdminInquiriesPage() {
  let inquiries: Inquiry[] = [];
  let fetchError: string | null = null;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      fetchError = error.message;
    } else {
      inquiries = (data as Inquiry[]) ?? [];
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Admin</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Booking Inquiries</h1>
        <p className="mt-2 text-sm text-slate-500">{inquiries.length} total {inquiries.length === 1 ? 'inquiry' : 'inquiries'}</p>
      </div>

      {fetchError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load inquiries: {fetchError}
        </div>
      )}

      {!fetchError && inquiries.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-16 text-center">
          <p className="text-slate-500">No inquiries yet.</p>
        </div>
      )}

      {inquiries.length > 0 && (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const company = inq.company_name || inq.company;
            return (
              <div
                key={inq.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-slate-900">{inq.name}</span>
                      <StatusBadge status={inq.status} />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span>{inq.email}</span>
                      {inq.phone && <span>{inq.phone}</span>}
                      {company && <span>{company}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(inq.created_at)}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {inq.production_type && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                      {inq.production_type}
                    </span>
                  )}
                  {inq.dates_needed && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                      {inq.dates_needed}
                    </span>
                  )}
                  {inq.duration && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                      {inq.duration}
                    </span>
                  )}
                  {inq.budget_range && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                      {inq.budget_range}
                    </span>
                  )}
                  {inq.crew_size && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                      Crew: {inq.crew_size}
                    </span>
                  )}
                  {inq.property_id && (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
                      Property: {inq.property_id}
                    </span>
                  )}
                  {inq.source && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                      via {inq.source}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
