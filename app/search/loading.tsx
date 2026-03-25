import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50 px-4 py-2 text-sm text-blue-600">
          <Search className="h-4 w-4 animate-pulse" />
          Loading search
        </div>
        <Skeleton className="mt-4 h-12 w-full max-w-2xl rounded-2xl" />
        <Skeleton className="mt-4 h-6 w-full max-w-xl rounded-xl" />
      </div>

      <div className="mb-8 rounded-[28px] border border-black/10 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row">
          <Skeleton className="h-14 flex-1 rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl md:w-36" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[28px] border border-black/10 bg-white p-0 shadow-soft">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-4 p-6">
              <Skeleton className="h-7 w-3/4 rounded-xl" />
              <Skeleton className="h-5 w-1/2 rounded-xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
