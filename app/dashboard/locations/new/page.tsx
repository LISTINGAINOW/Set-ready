"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewLocationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // TODO: implement form submission
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard/locations');
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard/locations" className="mb-4 inline-flex items-center text-blue-500 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Locations
        </Link>
        <h1 className="text-3xl font-bold">Add New Location</h1>
        <p className="text-blue-500">List a new property for production-ready shoots</p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Title</label>
              <input
                type="text"
                className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Modern Studio Loft in Downtown LA"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Price per hour ($)</label>
              <input
                type="number"
                className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="150"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">City</label>
              <input
                type="text"
                className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Los Angeles"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">State</label>
              <input
                type="text"
                className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CA"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Privacy Tier</label>
              <select className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Select tier</option>
                <option value="Private">Private</option>
                <option value="Public">Public</option>
                <option value="NDA Required">NDA Required</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Property Type</label>
              <select className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Select type</option>
                <option value="studio">Studio</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="warehouse">Warehouse</option>
                <option value="cabin">Cabin</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              placeholder="Describe the location, amenities, and any special features..."
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Amenities (comma separated)</label>
            <input
              type="text"
              className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="wifi, lighting, changing room, shower"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Content Types</label>
            <div className="flex flex-wrap gap-3">
              {["Photo shoot", "Video production", "Commercial", "Lifestyle", "Editorial"].map((type) => (
                <label key={type} className="inline-flex items-center">
                  <input type="checkbox" className="mr-2 rounded border-blue-200 bg-white" />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-6">
            <Link href="/dashboard/locations">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}