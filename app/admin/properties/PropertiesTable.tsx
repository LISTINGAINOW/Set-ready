'use client';
import { useState } from 'react';
import { Search, MapPin, DollarSign } from 'lucide-react';
import type { Location } from './page';

export default function PropertiesTable({ locations }: { locations: Location[] }) {
  const [search, setSearch] = useState('');

  const filtered = locations.filter((loc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      loc.propertyType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or city\u2026"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
        />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Name', 'City', 'Type', 'Price/hr', 'Beds/Baths', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                  No properties match your search.
                </td>
              </tr>
            ) : (
              filtered.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 max-w-xs truncate">{loc.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{loc.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-slate-600">
                      <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      {loc.city}, {loc.state}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {loc.propertyType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {loc.pricePerHour > 0 ? (
                      <span className="flex items-center gap-0.5">
                        <DollarSign className="h-3 w-3 text-slate-400" />
                        {loc.pricePerHour.toLocaleString()}/hr
                      </span>
                    ) : '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {loc.beds != null ? `${loc.beds} bd / ${loc.baths} ba` : '\u2014'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">Showing {filtered.length} of {locations.length} properties</p>
    </div>
  );
}
