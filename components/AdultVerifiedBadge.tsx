import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface AdultVerifiedBadgeProps {
  variant?: 'compact' | 'full';
  linkToPolicy?: boolean;
}

export default function AdultVerifiedBadge({ variant = 'compact', linkToPolicy = false }: AdultVerifiedBadgeProps) {
  const badge = (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
      <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
      All Productions Welcome
    </span>
  );

  if (variant === 'full') {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
        <ShieldCheck className="h-4 w-4 text-slate-500" />
        <span>All Productions Welcome</span>
        {linkToPolicy && (
          <Link
            href="/legal/adult-production-policy"
            className="ml-1 text-xs font-normal text-blue-600 underline hover:text-blue-800"
            onClick={(e) => e.stopPropagation()}
          >
            Policy
          </Link>
        )}
      </div>
    );
  }

  return badge;
}
