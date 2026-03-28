import { Skeleton } from '@/components/ui/skeleton';

export default function EarnLoading() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-black/10 bg-[#FAFAFA] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Skeleton className="mx-auto h-5 w-40 rounded-full" />
          <Skeleton className="mx-auto mt-5 h-12 w-3/4 rounded-2xl" />
          <Skeleton className="mx-auto mt-4 h-7 w-full max-w-xl rounded-xl" />
        </div>
      </section>

      {/* Calculator */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-black/10 bg-white p-8 shadow-soft">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="mt-2 h-12 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mt-8 rounded-[32px] border border-black/10 bg-white p-8 shadow-soft">
          <Skeleton className="h-7 w-40 rounded-xl" />
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-black/10 p-5">
                <Skeleton className="h-4 w-1/2 rounded-lg" />
                <Skeleton className="mt-3 h-9 w-2/3 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <Skeleton className="mx-auto mb-8 h-9 w-64 rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-black/10 bg-white p-6">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="mt-4 h-6 w-2/3 rounded-xl" />
              <Skeleton className="mt-3 h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <Skeleton className="mx-auto mt-10 h-12 w-48 rounded-full" />
      </section>
    </main>
  );
}
