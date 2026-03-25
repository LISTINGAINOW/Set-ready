import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-3xl border border-blue-500/15 bg-white/[0.03] px-5 py-4 text-sm text-blue-100/80">
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        Loading your dashboard
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-3xl bg-white/10" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="h-[320px] rounded-3xl bg-white/10" />
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-3xl bg-white/10" />
          <Skeleton className="h-40 rounded-3xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}
