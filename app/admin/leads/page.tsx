import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { readFileSync } from 'fs';
import { join } from 'path';
import LeadsClient from './LeadsClient';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  propertyType?: string;
  propertyAddress?: string;
  message?: string;
  ownsOrManagesProperty?: boolean;
  createdAt: string;
  status?: string;
  submittedIpHash?: string;
}

export default function AdminLeadsPage() {
  const token = cookies().get('admin-session')?.value;
  if (!token || !verifyAdminToken(token)) redirect('/admin/login');

  const raw = readFileSync(join(process.cwd(), 'data', 'leads.json'), 'utf-8');
  const { leads }: { leads: Lead[] } = JSON.parse(raw);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
        <p className="mt-1 text-sm text-slate-500">
          {leads.length} total leads &middot; {leads.filter((l) => !l.status || l.status === 'new').length} new
        </p>
      </div>
      <LeadsClient initialLeads={leads} />
    </div>
  );
}
