"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";

interface StoredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Inquiry {
  id: number;
  name: string;
  email: string;
  company: string | null;
  property_name: string;
  production_type: string | null;
  dates_needed: string | null;
  duration: string | null;
  crew_size: string | null;
  budget_range: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export default function OwnerInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    let user: StoredUser;
    try {
      user = JSON.parse(stored);
    } catch {
      return;
    }

    fetch(`/api/owner/inquiries?user_id=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((data) => setInquiries(data.inquiries ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Inquiries</h1>
        <p className="mt-1 text-sm text-slate-500">
          Inquiries received for your approved properties.
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <MessageSquare className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <p className="font-medium text-slate-700">No inquiries yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Once your properties are approved, production companies can send inquiries here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{inq.name}</p>
                      {inq.company && (
                        <span className="text-sm text-slate-500">· {inq.company}</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">{inq.property_name}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        inq.status === "new"
                          ? "bg-blue-100 text-blue-700"
                          : inq.status === "contacted"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {inq.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(inq.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </button>

              {expanded === inq.id && (
                <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-0.5">Email</p>
                      <p className="text-slate-700">{inq.email}</p>
                    </div>
                    {inq.production_type && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-0.5">Production Type</p>
                        <p className="text-slate-700">{inq.production_type}</p>
                      </div>
                    )}
                    {inq.dates_needed && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-0.5">Dates Needed</p>
                        <p className="text-slate-700">{inq.dates_needed}</p>
                      </div>
                    )}
                    {inq.duration && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-0.5">Duration</p>
                        <p className="text-slate-700">{inq.duration}</p>
                      </div>
                    )}
                    {inq.crew_size && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-0.5">Crew Size</p>
                        <p className="text-slate-700">{inq.crew_size}</p>
                      </div>
                    )}
                    {inq.budget_range && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-0.5">Budget Range</p>
                        <p className="text-slate-700">{inq.budget_range}</p>
                      </div>
                    )}
                    {inq.message && (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-medium text-slate-500 mb-0.5">Message</p>
                        <p className="text-slate-700 whitespace-pre-wrap">{inq.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
