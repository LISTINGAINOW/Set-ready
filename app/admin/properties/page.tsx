import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { readFileSync } from 'fs';
import { join } from 'path';
import PropertiesTable from './PropertiesTable';

export interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  propertyType: string;
  pricePerHour: number;
  pricePerDay: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  slug: string;
}

export default function AdminPropertiesPage() {
  const token = cookies().get('admin-session')?.value;
  if (!token || !verifyAdminToken(token)) redirect('/admin/login');

  const raw = readFileSync(join(process.cwd(), 'data', 'locations.json'), 'utf-8');
  const locations: Location[] = JSON.parse(raw);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
        <p className="mt-1 text-sm text-slate-500">{locations.length} properties listed</p>
      </div>
      <PropertiesTable locations={locations} />
    </div>
  );
}
