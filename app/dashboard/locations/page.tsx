import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Plus, MapPin } from "lucide-react";
import Link from "next/link";
import locationsData from '@/data/locations.json';

interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  pricePerHour: number;
  style: string;
  propertyType: string;
  amenities: string[];
  images: string[];
}

export default function LocationsPage() {
  const locations = locationsData as unknown as Location[];

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-blue-500">Manage your property listings</p>
        </div>
        <Link href="/dashboard/locations/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Location
          </Button>
        </Link>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <div className="text-2xl font-bold">{locations.length}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-500">Active properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price /hr</CardTitle>
            <div className="text-2xl font-bold">
              ${Math.round(locations.reduce((sum, loc) => sum + loc.pricePerHour, 0) / locations.length)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-500">Across all listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Common Tier</CardTitle>
            <div className="text-2xl font-bold">
              {(() => {
                const tiers = locations.map(l => l.style || 'Standard');
                const counts: Record<string, number> = {};
                tiers.forEach(t => counts[t] = (counts[t] || 0) + 1);
                const max = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
                return max[0];
              })()}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-500">Privacy tier</p>
          </CardContent>
        </Card>
      </div>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-blue-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Thumbnail</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Price/hr</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Privacy Tier</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.id} className="border-b border-blue-100 transition-colors hover:bg-blue-50">
                    <td className="py-3 px-4">
                      <div className="w-16 h-12 rounded-md bg-blue-100 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-blue-500" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{location.name}</div>
                      <div className="text-sm text-blue-500">{location.city}, {location.state}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold">${location.pricePerHour}</div>
                      <div className="text-sm text-blue-500">per hour</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {location.style || 'Standard'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="p-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2 text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {locations.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
            <MapPin className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No locations yet</h3>
          <p className="text-blue-500 mb-6">Start by adding your first property listing</p>
          <Link href="/dashboard/locations/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Location
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}