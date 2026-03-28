import { Skeleton } from '@/components/ui/skeleton';

export default function LocationDetailLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-40 rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] xl:gap-12">
          {/* Main content */}
          <div>
            {/* Photo gallery */}
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <div className="mt-4 flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-24 flex-shrink-0 rounded-xl" />
              ))}
            </div>

            {/* Title + location */}
            <div className="mt-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Skeleton className="h-9 w-3/4 rounded-2xl" />
                  <Skeleton className="mt-3 h-5 w-1/2 rounded-xl" />
                </div>
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
            </div>

            {/* Property details grid */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-black/10 bg-white p-4">
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                  <Skeleton className="mt-2 h-7 w-2/3 rounded-xl" />
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mt-8 space-y-3">
              <Skeleton className="h-6 w-40 rounded-xl" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded-lg" />
            </div>

            {/* Amenities */}
            <div className="mt-8">
              <Skeleton className="mb-4 h-6 w-32 rounded-xl" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-24 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-soft">
              <Skeleton className="h-8 w-1/2 rounded-xl" />
              <Skeleton className="mt-2 h-5 w-1/3 rounded-lg" />
              <Skeleton className="mt-6 h-14 w-full rounded-2xl" />
              <Skeleton className="mt-4 h-14 w-full rounded-2xl" />
              <div className="mt-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-1/3 rounded-lg" />
                    <Skeleton className="h-4 w-1/4 rounded-lg" />
                  </div>
                ))}
              </div>
              <Skeleton className="mt-6 h-12 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
