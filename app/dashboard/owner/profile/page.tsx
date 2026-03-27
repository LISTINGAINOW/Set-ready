"use client";

import { useEffect, useState } from "react";
import { User, Mail, Calendar, Building2, CheckCircle, Pencil, Loader2 } from "lucide-react";

interface StoredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  email_verified: boolean;
}

export default function OwnerProfilePage() {
  const [localUser, setLocalUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [listingCount, setListingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    let parsed: StoredUser;
    try {
      parsed = JSON.parse(stored);
    } catch {
      return;
    }
    setLocalUser(parsed);

    fetch(`/api/owner/profile?user_id=${encodeURIComponent(parsed.id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
          setListingCount(data.listingCount ?? 0);
          setForm({ first_name: data.user.first_name, last_name: data.user.last_name });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!localUser) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/owner/profile?user_id=${encodeURIComponent(localUser.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Failed to save");
      } else {
        setProfile(data.user);
        setSaveSuccess(true);
        setEditing(false);
        // Update localStorage
        const updated = { ...localUser, firstName: data.user.first_name, lastName: data.user.last_name };
        localStorage.setItem("user", JSON.stringify(updated));
        setLocalUser(updated);
      }
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : `${localUser?.firstName} ${localUser?.lastName}`;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account information.</p>
      </div>

      {/* Profile card */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
            {(profile?.first_name ?? localUser?.firstName ?? "O")[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-slate-900">{displayName}</h2>
            <p className="text-sm text-slate-500">{profile?.email ?? localUser?.email}</p>
            {profile?.email_verified && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle className="h-3.5 w-3.5" /> Email verified
              </span>
            )}
          </div>
        </div>

        {/* Info rows */}
        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Mail className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">{profile?.email ?? localUser?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
            <span>
              Joined{" "}
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
            <span>
              {listingCount} listing{listingCount !== 1 ? "s" : ""} submitted
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <User className="h-4 w-4 shrink-0 text-slate-400" />
            <span>Property Owner</span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Edit Profile</h3>
          {!editing && (
            <button
              onClick={() => {
                setEditing(true);
                setSaveSuccess(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
        </div>

        {saveSuccess && !editing && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Profile updated successfully.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">First Name</label>
            <input
              type="text"
              value={editing ? form.first_name : (profile?.first_name ?? localUser?.firstName ?? "")}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              disabled={!editing}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Last Name</label>
            <input
              type="text"
              value={editing ? form.last_name : (profile?.last_name ?? localUser?.lastName ?? "")}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              disabled={!editing}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={profile?.email ?? localUser?.email ?? ""}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
          </div>
        </div>

        {saveError && (
          <p className="mt-3 text-sm text-red-600">{saveError}</p>
        )}

        {editing && (
          <div className="mt-5 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setSaveError(null);
                if (profile) {
                  setForm({ first_name: profile.first_name, last_name: profile.last_name });
                }
              }}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
