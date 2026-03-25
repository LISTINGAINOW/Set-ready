"use client";

import { useEffect, useState } from "react";
import { Home, Calendar, Heart, Shield, User, LogOut, Menu, X, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

interface StoredUser {
  email: string;
}

export default function ProducerLayout({
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
    <AuthGuard requireVerified={false}>
      <div className="min-h-screen bg-black text-white">
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-blue-200 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/90 lg:flex flex-col transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-6 border-b border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Producer Account</p>
                <p className="text-sm text-blue-500">{user?.email || 'producer@example.com'}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/producer" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-black transition-colors text-white hover:text-white" onClick={() => setSidebarOpen(false)}>
              <Home className="w-5 h-5" />
              <span>Overview</span>
            </Link>
            <Link href="/producer/search" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-black transition-colors text-white hover:text-white" onClick={() => setSidebarOpen(false)}>
              <Search className="w-5 h-5" />
              <span>Search Locations</span>
            </Link>
            <Link href="/producer/bookings" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-black transition-colors text-white hover:text-white" onClick={() => setSidebarOpen(false)}>
              <Calendar className="w-5 h-5" />
              <span>My Bookings</span>
            </Link>
            <Link href="/producer/favorites" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-black transition-colors text-white hover:text-white" onClick={() => setSidebarOpen(false)}>
              <Heart className="w-5 h-5" />
              <span>Favorites</span>
            </Link>
            <Link href="/producer/insurance" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-black transition-colors text-white hover:text-white" onClick={() => setSidebarOpen(false)}>
              <Shield className="w-5 h-5" />
              <span>Insurance</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-blue-200">
            <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-black transition-colors text-white hover:text-white w-full">
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
          <button className="absolute top-4 right-4 lg:hidden p-2 rounded-lg border border-blue-200 hover:bg-black transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <header className="sticky top-0 z-40 border-b border-blue-200 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/90 lg:hidden">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="font-semibold">Producer Dashboard</span>
            </div>
            <button className="p-2 rounded-lg border border-blue-200 hover:bg-black transition-colors" onClick={() => setSidebarOpen(true)}>
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
