import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl font-bold text-slate-200">404</div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Location not found</h1>
      <p className="mt-2 max-w-md text-slate-600">
        This property may have been removed or the URL might be incorrect. Browse our available locations instead.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/locations"
          className="rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 transition"
        >
          Browse Locations
        </Link>
        <Link
          href="/find-location"
          className="rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Find Me a Location
        </Link>
      </div>
    </div>
  );
}
