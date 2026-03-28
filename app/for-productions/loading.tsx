import { Skeleton } from '@/components/ui/skeleton';

export default function ForProductionsLoading() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-black/10 bg-[#FAFAFA] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Skeleton className="mx-auto h-5 w-44 rounded-full" />
          <Skeleton className="mx-auto mt-5 h-14 w-5/6 rounded-2xl" />
          <Skeleton className="mx-auto mt-4 h-7 w-full max-w-xl rounded-xl" />
          <div className="mx-auto mt-8 flex justify-center gap-4">
            <Skeleton className="h-12 w-40 rounded-full" />
            <Skeleton className="h-12 w-36 rounded-full" />
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Skeleton className="mx-auto mb-10 h-9 w-64 rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-soft">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="mt-4 h-6 w-1/2 rounded-xl" />
              <Skeleton className="mt-3 h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </section>

      {/* Features list */}
      <section className="bg-[#FAFAFA] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="mx-auto mb-10 h-9 w-48 rounded-2xl" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-5">
                <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-2/3 rounded-lg" />
                  <Skeleton className="mt-2 h-10 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <Skeleton className="mx-auto h-9 w-72 rounded-2xl" />
        <Skeleton className="mx-auto mt-4 h-6 w-full max-w-md rounded-xl" />
        <Skeleton className="mx-auto mt-8 h-12 w-48 rounded-full" />
      </section>
    </main>
  );
}
