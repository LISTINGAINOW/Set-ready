"use client";

import { useState, useEffect, useRef } from "react";

const TEMPLATES = [
  { id: "welcome", label: "Welcome Email" },
  { id: "inquiry-notification", label: "New Inquiry (to admin)" },
  { id: "inquiry-confirmation", label: "Inquiry Confirmation (to submitter)" },
  { id: "submission-received", label: "Submission Received (to owner)" },
  { id: "submission-approved", label: "Submission Approved (to owner)" },
  { id: "submission-rejected", label: "Submission Rejected (to owner)" },
  { id: "changes-requested", label: "Changes Requested (to owner)" },
  { id: "booking-confirmation", label: "Booking Confirmation" },
  { id: "newsletter", label: "Newsletter" },
];

export default function EmailPreviewPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [selected, setSelected] = useState(TEMPLATES[0].id);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [storedPwd, setStoredPwd] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("sv-admin-email-pwd");
    if (saved) {
      setStoredPwd(saved);
      setAuthed(true);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    // Verify password against the preview API
    const res = await fetch(
      `/api/admin/emails/preview?template=welcome&pwd=${encodeURIComponent(password)}`
    );
    if (res.ok) {
      sessionStorage.setItem("sv-admin-email-pwd", password);
      setStoredPwd(password);
      setAuthed(true);
    } else {
      setAuthError("Incorrect password.");
    }
  }

  useEffect(() => {
    if (!authed || !storedPwd) return;
    setLoading(true);
    fetch(
      `/api/admin/emails/preview?template=${selected}&pwd=${encodeURIComponent(storedPwd)}`
    )
      .then((r) => r.text())
      .then((html) => {
        setPreviewHtml(html);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selected, authed, storedPwd]);

  // Write HTML into iframe via srcdoc to avoid navigation
  useEffect(() => {
    if (iframeRef.current && previewHtml !== null) {
      iframeRef.current.srcdoc = previewHtml;
    }
  }, [previewHtml]);

  function logout() {
    sessionStorage.removeItem("sv-admin-email-pwd");
    setAuthed(false);
    setStoredPwd(null);
    setPassword("");
    setPreviewHtml(null);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold leading-none">
                S
              </span>
            </div>
            <span className="text-gray-900 text-lg font-bold">SetVenue</span>
          </div>
          <h1 className="text-xl font-700 text-gray-900 mb-1 font-bold">
            Email preview
          </h1>
          <p className="text-sm text-gray-500 mb-6">Admin access required.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="pwd"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Admin password
              </label>
              <input
                id="pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            {authError && (
              <p className="text-sm text-red-600">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              Continue
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-400">
            Set <code className="bg-gray-100 px-1 rounded">ADMIN_PASSWORD</code>{" "}
            in your environment to enable protection. If not set, any password
            works.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base leading-none">
              S
            </span>
          </div>
          <span className="font-bold text-gray-900">SetVenue</span>
          <span className="text-gray-300 mx-1">/</span>
          <span className="text-gray-600 text-sm">Email Previews</span>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sign out
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 px-2">
              Templates ({TEMPLATES.length})
            </p>
            <nav className="space-y-0.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selected === t.id
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Preview pane */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">
                {TEMPLATES.find((t) => t.id === selected)?.label}
              </span>
              <span className="ml-2 text-xs text-gray-400 font-mono">
                {selected}
              </span>
            </div>
            {loading && (
              <span className="text-xs text-gray-400 animate-pulse">
                Loading&hellip;
              </span>
            )}
          </div>
          <div className="flex-1 p-6">
            {previewHtml !== null ? (
              <iframe
                ref={iframeRef}
                title="Email preview"
                className="w-full h-full rounded-xl border border-gray-200 shadow-sm bg-white"
                style={{ minHeight: "calc(100vh - 160px)" }}
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                {loading ? "Loading preview…" : "Select a template"}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
