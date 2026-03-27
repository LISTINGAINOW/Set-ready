"use client";

import { useEffect, useState } from "react";
import { Home, MapPin, Calendar, User, Settings, LogOut, Menu, X, Building2, Wallet, CalendarRange, CircleDollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

interface StoredUser {
  firstName: string;
  lastName: string;
  email: string;
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem('user');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white text-black">
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-blue-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 lg:flex flex-col transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-6 border-b border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Owner Account</p>
                <p className="text-sm text-blue-500">{user?.email || 'owner@example.com'}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-black transition-colors hover:bg-blue-50 hover:text-blue-700" onClick={() => setSidebarOpen(false)}>
              <Home className="w-5 h-5" />
              <span>Overview</span>
            </Link>
            <Link href="/dashboard/host" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-black transition-colors hover:bg-blue-50 hover:text-blue-700" onClick={() => setSidebarOpen(false)}>
              <Building2 className="w-5 h-5" />
              <span>Host Dashboard</span>
            </Link>
            <Link href="/dashboard/host/listings" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-black transition-colors hover:bg-blue-50 hover:text-blue-700" onClick={() => setSidebarOpen(false)}>
              <MapPin className="w-5 h-5" />
              <span>My Listings</span>
            </Link>
            <Link href="/dashboard/host/bookings" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-black transition-colors hover:bg-blue-50 hover:text-blue-700" onClick={() => setSidebarOpen(false)}>
              <Calendar className="w-5 h-5" />
              <span>Host Bookings</span>
            </Link>
            <Link href="/dashboard/host/offers" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-black transition-colors hover:bg-blue-50 hover:text-blue-700" onClick={() => setSidebarOpen(false)}>
              <CircleDollarSign className="w-5 h-5" />
              <span>Offers</span>
            </Link>
            <Link href="/dashboard/owner/earnings" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-black transition-colors hover:bg-blue-50 hover:text-blue-700" onClick={() => setSidebarOpen(false)}>
              <TrendingUp className="w-5 h-5" />
              <span>My Earnings</span>
            </Link>
            <Link href="/dashboard/bookings" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-black transition-colors hover:bg-blue-50 hover:text-blue-700" onClick={() => setSidebarOpen(false)}>
              <Wallet className="w-5 h-5" />
              <span>Legacy Bookings</span>
            </Link>
            <Link href="/dashboard/settings" className="mt-8 flex items-center space-x-3 rounded-lg px-4 py-3 text-black transition-colors hover:bg-blue-50 hover:text-blue-700" onClick={() => setSidebarOpen(false)}>
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>
          <div className="border-t border-blue-100 p-4">
            <button onClick={handleLogout} className="flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-black transition-colors hover:bg-blue-50 hover:text-blue-700">
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
          <button className="absolute right-4 top-4 rounded-lg border border-blue-100 p-2 text-black transition-colors hover:bg-blue-50 hover:text-blue-700 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 lg:hidden">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="font-semibold">Owner Dashboard</span>
            </div>
            <button className="rounded-lg border border-blue-100 p-2 text-black transition-colors hover:bg-blue-50 hover:text-blue-700" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/85 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="lg:pl-64">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
