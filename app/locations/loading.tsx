import { Skeleton } from '@/components/ui/skeleton';

export default function LocationsLoading() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-soft sm:rounded-[36px]">
          <div className="border-b border-black/10 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <Skeleton className="h-4 w-40 rounded-full" />
            <Skeleton className="mt-4 h-14 w-full max-w-3xl rounded-2xl" />
            <Skeleton className="mt-4 h-7 w-full max-w-2xl rounded-xl" />
          </div>
          <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="space-y-4">
              <Skeleton className="h-5 w-32 rounded-full" />
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-11 w-28 rounded-full" />)}
              </div>
            </div>
            <div className="rounded-[24px] border border-black/10 bg-[#FAFAFA] p-4 sm:rounded-[28px] sm:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 rounded-2xl" />)}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-soft">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-4 p-6">
                <Skeleton className="h-8 w-2/3 rounded-xl" />
                <Skeleton className="h-5 w-1/2 rounded-xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-20 rounded-2xl" />
                  <Skeleton className="h-20 rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
