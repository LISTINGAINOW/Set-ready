'use client';
import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, MapPin, Phone, Mail, Building2 } from 'lucide-react';
import type { Lead } from './page';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'archived';

const STATUS_CONFIG: Record<LeadStatus, { label: string; bg: string; text: string }> = {
  new:       { label: 'New',       bg: 'bg-green-100',  text: 'text-green-800' },
  contacted: { label: 'Contacted', bg: 'bg-blue-100',   text: 'text-blue-800' },
  qualified: { label: 'Qualified', bg: 'bg-purple-100', text: 'text-purple-800' },
  converted: { label: 'Converted', bg: 'bg-amber-100',  text: 'text-amber-800' },
  archived:  { label: 'Archived',  bg: 'bg-slate-100',  text: 'text-slate-600' },
};

const ALL_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'archived'];

function getStatus(lead: Lead): LeadStatus {
  if (!lead.status || lead.status === 'new') return 'new';
  return (lead.status as LeadStatus) in STATUS_CONFIG ? (lead.status as LeadStatus) : 'new';
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<(Lead & { _status: LeadStatus })[]>(
    initialLeads.map((l) => ({ ...l, _status: getStatus(l) }))
  );
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = leads.filter((l) => {
    const matchStatus = filterStatus === 'all' || l._status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.propertyType ?? '').toLowerCase().includes(q) ||
      (l.propertyAddress ?? '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  function updateStatus(id: string, status: LeadStatus) {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, _status: status } : l))
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, property\u2026"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filterStatus === 'all' ? 'bg-green-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filterStatus === s ? 'bg-green-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {STATUS_CONFIG[s].label}
              <span className="ml-1 opacity-70">{leads.filter((l) => l._status === s).length}</span>
            </button>
          ))}
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Building2 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No leads yet</p>
          <p className="mt-1 text-xs text-slate-400">Host leads will appear here when submitted.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const isExpanded = expanded === lead.id;
            return (
              <div
                key={lead.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                <div
                  className="flex items-start justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition"
                  onClick={() => setExpanded(isExpanded ? null : lead.id)}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm">{lead.name}</span>
                        <StatusBadge status={lead._status} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                        {lead.propertyType && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {lead.propertyType}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{fmt(lead.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 py-4 bg-slate-50 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</h3>
                        <dl className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              <a href={`tel:${lead.phone}`} className="text-slate-700">{lead.phone}</a>
                            </div>
                          )}
                          {lead.propertyAddress && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              <span className="text-slate-700">{lead.propertyAddress}</span>
                            </div>
                          )}
                        </dl>
                      </div>
                      {lead.message && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Message</h3>
                          <p className="text-sm text-slate-700 leading-relaxed">{lead.message}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Update Status</h3>
                      <div className="flex gap-1.5 flex-wrap">
                        {ALL_STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(lead.id, s)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition border ${
                              lead._status === s
                                ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].text} border-transparent`
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">Status changes are session-only and not persisted.</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-slate-400">Showing {filtered.length} of {leads.length} leads</p>
    </div>
  );
}
