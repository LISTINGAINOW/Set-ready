'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Building2, Calendar, MessageSquare, Users, Menu, LogOut } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/properties', label: 'Properties', icon: Building2 },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/leads', label: 'Leads', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login page gets a clean full-screen layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    router.push('/admin/login');
  }

  const Sidebar = () => (
    <nav className="flex h-full flex-col bg-slate-900">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white text-sm font-bold flex-shrink-0">
          SV
        </div>
        <span className="text-white font-semibold text-sm">SetVenue Admin</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-green-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-56 lg:flex-shrink-0 lg:flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 flex w-56 flex-col">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
          <button
            className="lg:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:flex items-center">
            <span className="text-sm font-semibold text-slate-900">
              {NAV.find(n => n.href === pathname || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label ?? 'Admin'}
            </span>
          </div>
          <div className="flex lg:hidden items-center gap-2">
            <div className="h-6 w-6 rounded bg-green-600 text-white text-xs font-bold flex items-center justify-center">SV</div>
            <span className="text-sm font-semibold text-slate-900">SetVenue Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
