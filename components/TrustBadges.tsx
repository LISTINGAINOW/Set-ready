import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  RefreshCcw,
  ShieldCheck,
  ShieldEllipsis,
  Sparkles,
  WalletCards,
} from 'lucide-react';

type TrustBadgesProps = {
  isVerified?: boolean;
  verificationBadges?: string[];
  responseTime?: string;
  variant?: 'compact' | 'full';
  showTitle?: boolean;
};

const badgeIconMap: Record<string, typeof CheckCircle2> = {
  'Identity verified': BadgeCheck,
  'Phone verified': ShieldCheck,
  'Email verified': CheckCircle2,
  'ID Verified': BadgeCheck,
  Superhost: Sparkles,
  'Verified Host': BadgeCheck,
  '100% Money-back guarantee': RefreshCcw,
  'Free cancellation within 24h': Clock3,
  'SSL secured': LockKeyhole,
  'Secure payment': WalletCards,
  'Privacy protected': ShieldEllipsis,
  'GDPR compliant': ShieldCheck,
};

const platformTrustBadges = [
  '100% Money-back guarantee',
  'Free cancellation within 24h',
  'SSL secured',
  'Secure payment',
  'Privacy protected',
  'GDPR compliant',
];

export default function TrustBadges({
  isVerified = false,
  verificationBadges = [],
  responseTime,
  variant = 'full',
  showTitle = false,
}: TrustBadgesProps) {
  const badges = [
    ...(isVerified ? [{ label: 'Verified Host', icon: BadgeCheck }] : []),
    ...verificationBadges.map((label) => ({
      label,
      icon: badgeIconMap[label] || CheckCircle2,
    })),
    ...platformTrustBadges.map((label) => ({
      label,
      icon: badgeIconMap[label] || CheckCircle2,
    })),
  ].filter((badge, index, array) => array.findIndex((item) => item.label === badge.label) === index);

  const badgeClassName =
    variant === 'compact'
      ? 'inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/8 px-3 py-1 text-xs font-semibold text-slate-700'
      : 'inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/[0.07] px-3 py-2 text-sm font-semibold text-slate-800';

  return (
    <div>
      {showTitle && <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Trust & protection</p>}
      <div className="flex flex-wrap gap-2">
        {badges.map(({ label, icon: Icon }) => (
          <span key={label} className={badgeClassName}>
            <Icon className={variant === 'compact' ? 'h-3.5 w-3.5 text-blue-600' : 'h-4 w-4 text-blue-600'} />
            {label}
          </span>
        ))}
        {responseTime && (
          <span className={badgeClassName}>
            <Clock3 className={variant === 'compact' ? 'h-3.5 w-3.5 text-blue-600' : 'h-4 w-4 text-blue-600'} />
            {responseTime}
          </span>
        )}
      </div>
    </div>
  );
}
