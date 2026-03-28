import { Skeleton } from '@/components/ui/skeleton';

export default function HomeLoading() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* Hero section */}
      <section className="relative flex min-h-[600px] items-end justify-center overflow-hidden bg-slate-100 px-4 pb-16 sm:min-h-[680px] sm:px-6">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="relative z-10 mx-auto w-full max-w-2xl">
          <Skeleton className="mx-auto h-12 w-3/4 rounded-2xl" />
          <Skeleton className="mx-auto mt-4 h-7 w-1/2 rounded-xl" />
          <Skeleton className="mt-8 h-16 w-full rounded-full" />
        </div>
      </section>

      {/* Trust points */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-black/10 bg-white p-6">
              <Skeleton className="h-5 w-1/2 rounded-lg" />
              <Skeleton className="mt-3 h-14 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </section>

      {/* Featured locations */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-64 rounded-2xl" />
        <Skeleton className="mt-3 h-6 w-96 rounded-xl" />
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-soft">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-4 p-6">
                <Skeleton className="h-7 w-2/3 rounded-xl" />
                <Skeleton className="h-5 w-1/2 rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
