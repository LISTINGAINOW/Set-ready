import { readFileSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';
import { FileText } from 'lucide-react';

type SubmissionStatus = 'pending_review' | 'approved' | 'rejected' | 'changes_requested';

interface Submission {
  id: string;
  title: string;
  property_type: string;
  city: string;
  state: string;
  submitted_at: string;
  status: SubmissionStatus;
  contact_name: string;
  contact_email: string;
}

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Changes Requested',
};

const STATUS_CLASSES: Record<SubmissionStatus, string> = {
  pending_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  changes_requested: 'bg-blue-100 text-blue-800',
};

function loadSubmissions(): Submission[] {
  try {
    const filePath = join(process.cwd(), 'data', 'submissions.json');
    return JSON.parse(readFileSync(filePath, 'utf-8')) as Submission[];
  } catch {
    return [];
  }
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const all = loadSubmissions();
  const filtered =
    status && status !== 'all'
      ? all.filter((s) => s.status === status)
      : all;

  const counts = all.reduce<Record<string, number>>(
    (acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const filters: { value: string; label: string }[] = [
    { value: 'all', label: `All (${all.length})` },
    { value: 'pending_review', label: `Pending (${counts.pending_review ?? 0})` },
    { value: 'approved', label: `Approved (${counts.approved ?? 0})` },
    { value: 'changes_requested', label: `Changes Requested (${counts.changes_requested ?? 0})` },
    { value: 'rejected', label: `Rejected (${counts.rejected ?? 0})` },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-slate-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Submissions</h1>
            <p className="text-sm text-slate-500">{all.length} total submission{all.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (status ?? 'all') === f.value;
          return (
            <Link
              key={f.value}
              href={f.value === 'all' ? '/admin/submissions' : `/admin/submissions?status=${f.value}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="mx-auto mb-3 h-8 w-8 opacity-40" />
            <p className="text-sm">No submissions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600">Title</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Type</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Location</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Contact</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Submitted</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">
                      {sub.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{sub.property_type}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {sub.city}, {sub.state}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[180px]">
                      <div className="truncate">{sub.contact_name}</div>
                      <div className="truncate text-xs text-slate-400">{sub.contact_email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(sub.submitted_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_CLASSES[sub.status as SubmissionStatus] ?? 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {STATUS_LABELS[sub.status as SubmissionStatus] ?? sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/submissions/${sub.id}`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
