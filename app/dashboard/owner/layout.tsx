"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  MessageSquare,
  User,
  PlusCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

interface StoredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const NAV_ITEMS = [
  { href: "/dashboard/owner", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/owner/listings", label: "My Listings", icon: MapPin },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/owner/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/dashboard/owner/profile", label: "Profile", icon: User },
  { href: "/list-property", label: "List a Property", icon: PlusCircle },
];

function SidebarNav({
  user,
  onClose,
  onLogout,
}: {
  user: StoredUser | null;
  onClose?: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo / brand */}
      <div className="border-b border-slate-200 px-6 py-5">
        <Link href="/dashboard/owner" onClick={onClose} className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900">SetVenue</span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            Owner
          </span>
        </Link>
        {user && (
          <p className="mt-1 truncate text-sm text-slate-500">
            {user.firstName} {user.lastName}
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    try {
      setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <SidebarNav user={user} onLogout={handleLogout} />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar panel */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white transition-transform lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
          <SidebarNav
            user={user}
            onClose={() => setSidebarOpen(false)}
            onLogout={handleLogout}
          />
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-slate-900">Owner Dashboard</span>
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.firstName?.[0] ?? "O"}
          </div>
        </header>

        {/* Main content */}
        <main className="lg:pl-60">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
