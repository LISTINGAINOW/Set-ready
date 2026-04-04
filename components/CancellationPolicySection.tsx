import { BadgeCheck, Clock3, ShieldAlert } from 'lucide-react';
import type { CancellationPolicyTier } from '@/types/location';

interface CancellationPolicySectionProps {
  tier: CancellationPolicyTier;
  /** Optional compact variant — renders as a single-line badge/summary row */
  variant?: 'full' | 'compact';
}

const POLICY_CONTENT: Record<
  CancellationPolicyTier,
  { summary: string; refundWindow: string; details: string; color: string; bgColor: string; borderColor: string }
> = {
  Flexible: {
    summary: 'Full refund if cancelled 24+ hours before the booking start time.',
    refundWindow: '24+ hours before booking',
    details: 'Best for productions that need room to shift dates without penalty.',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  Moderate: {
    summary: 'Full refund if cancelled 48+ hours before the booking start time.',
    refundWindow: '48+ hours before booking',
    details: 'Balanced protection for both hosts and guests on medium-lead bookings.',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  Strict: {
    summary: '50% refund if cancelled 72+ hours before the booking start time.',
    refundWindow: '72+ hours before booking',
    details: 'Best for premium dates and properties that block off significant host time.',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export default function CancellationPolicySection({
  tier,
  variant = 'full',
}: CancellationPolicySectionProps) {
  const policy = POLICY_CONTENT[tier];

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full border ${policy.borderColor} ${policy.bgColor} px-4 py-2 text-sm font-medium ${policy.color}`}>
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span className="font-semibold">{tier} cancellation</span>
        <span className="text-xs opacity-75">· {policy.refundWindow}</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black bg-white/70 p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className={`rounded-xl ${policy.bgColor} p-3 ${policy.color}`}>
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Cancellation policy</p>
          <h2 className="mt-2 text-2xl font-bold text-black">{tier}</h2>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-black/80 sm:text-base">{policy.summary}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-black/10 bg-black p-4 text-white">
          <div className="flex items-center gap-2 text-sm text-blue-300">
            <Clock3 className="h-4 w-4" />
            Refund window
          </div>
          <p className="mt-2 text-lg font-semibold">{policy.refundWindow}</p>
        </div>
        <div className={`rounded-xl border ${policy.borderColor} ${policy.bgColor} p-4`}>
          <div className={`flex items-center gap-2 text-sm ${policy.color}`}>
            <BadgeCheck className="h-4 w-4" />
            What to expect
          </div>
          <p className="mt-2 text-sm leading-6 text-black/80">{policy.details}</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-black/10 bg-white p-4">
        <p className="text-sm font-semibold text-black">Refund rules</p>
        <ul className="mt-3 space-y-2 text-sm text-black/70">
          <li>• Cancellation timing is measured against the scheduled booking start time.</li>
          <li>• Refunds apply to the booking amount before any non-refundable payment processing charges.</li>
          <li>• Guests should cancel through the platform so the timeline is documented clearly.</li>
        </ul>
      </div>
    </div>
  );
}
