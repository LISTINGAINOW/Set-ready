import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { readFileSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';
import { Building2, Calendar, MessageSquare, Users, DollarSign, Clock } from 'lucide-react';

function readData<T>(filename: string): T {
  const content = readFileSync(join(process.cwd(), 'data', filename), 'utf-8');
  return JSON.parse(content);
}

export default function AdminDashboardPage() {
  const token = cookies().get('admin-session')?.value;
  if (!token || !verifyAdminToken(token)) {
    redirect('/admin/login');
  }

  const locations = readData<unknown[]>('locations.json');
  const { bookings } = readData<{ bookings: Array<{ status: string; total?: number; amount?: number }> }>('bookings.json');
  const { conversations } = readData<{ conversations: Array<{ unreadCount: number }> }>('messages.json');
  const { leads } = readData<{ leads: Array<{ status?: string }> }>('leads.json');

  const stats = {
    totalProperties: locations.length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.total ?? b.amount ?? 0), 0),
    unreadMessages: conversations.filter((c) => c.unreadCount > 0).length,
    newLeads: leads.filter((l) => !l.status || l.status === 'new').length,
  };

  const statCards = [
    { label: 'Total Properties', value: stats.totalProperties, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/properties' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/bookings' },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', href: '/admin/bookings' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', href: '/admin/bookings' },
  ];

  const quickLinks = [
    { label: 'Properties', desc: `${stats.totalProperties} listed`, icon: Building2, href: '/admin/properties', color: 'border-blue-100 hover:border-blue-300' },
    { label: 'Bookings', desc: `${stats.pendingBookings} pending`, icon: Calendar, href: '/admin/bookings', color: 'border-purple-100 hover:border-purple-300' },
    { label: 'Messages', desc: `${stats.unreadMessages} unread`, icon: MessageSquare, href: '/admin/messages', color: 'border-green-100 hover:border-green-300' },
    { label: 'Leads', desc: `${stats.newLeads} new`, icon: Users, href: '/admin/leads', color: 'border-orange-100 hover:border-orange-300' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back. Here&apos;s what&apos;s happening at SetVenue.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className={`inline-flex rounded-xl p-2.5 ${card.bg} mb-3`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{card.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition group ${link.color}`}
              >
                <Icon className="h-6 w-6 text-slate-400 group-hover:text-slate-600 mb-3 transition" />
                <div className="text-sm font-semibold text-slate-900">{link.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{link.desc}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
