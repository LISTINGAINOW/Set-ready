'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, CheckCircle2, Globe2, HeartHandshake, ShieldCheck, Sparkles, Star, WalletCards } from 'lucide-react';

type StatItem = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: React.ComponentType<{ className?: string }>;
};

type SocialCard = {
  title: string;
  subtitle: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
};

type StatsBannerProps = {
  propertyCount: number;
};

const trustedBy = ['Studio Teams', 'Independent Creators', 'Brand Producers', 'Talent Managers', 'Agency Shoots'];

const socialCards: SocialCard[] = [
  {
    title: 'X / Twitter',
    subtitle: 'Live mentions',
    body: 'Placeholder for real-time creator feedback and launch mentions.',
    icon: Sparkles,
  },
  {
    title: 'Instagram',
    subtitle: 'Recent feed',
    body: 'Placeholder for a curated visual feed from recent productions.',
    icon: Star,
  },
  {
    title: 'Recent activity',
    subtitle: 'Platform pulse',
    body: '2 new location requests, 1 booking confirmed, and 3 shortlist saves today.',
    icon: CheckCircle2,
  },
];

const guaranteeBadges = [
  { label: '100% money-back guarantee', icon: ShieldCheck },
  { label: 'Free cancellation within 24h', icon: HeartHandshake },
  { label: 'Verified hosts only', icon: CheckCircle2 },
  { label: 'Secure payments', icon: WalletCards },
];

function formatValue(value: number, decimals = 0) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function StatsBanner({ propertyCount }: StatsBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  const stats = useMemo<StatItem[]>(() => [
    {
      label: 'Properties listed',
      value: Math.max(propertyCount, 48),
      suffix: '+',
      icon: Building2,
    },
    {
      label: 'Bookings completed',
      value: 320,
      suffix: '+',
      icon: CheckCircle2,
    },
    {
      label: 'Happy customers',
      value: 180,
      suffix: '+',
      icon: HeartHandshake,
    },
    {
      label: 'Cities covered',
      value: 12,
      suffix: '+',
      icon: Globe2,
    },
  ], [propertyCount]);

  useEffect(() => {
    const node = sectionRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    let frame = 0;
    const start = performance.now();
    const duration = 1200;

    const tick = (now: number) => {
      const elapsed = now - start;
      const next = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - next, 3);
      setProgress(eased);

      if (next < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[28px] border border-black bg-black p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:rounded-[36px] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">
              <ShieldCheck className="h-4 w-4" />
              Credibility built in
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Quietly premium. Clearly trustworthy.
            </h2>
            <p className="mt-3 text-base leading-7 text-white/70 sm:text-lg">
              The marketplace is designed to look polished, communicate trust fast, and remove doubt before a guest ever reaches checkout.
            </p>
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const currentValue = isVisible ? stat.value * progress : 0;
              const displayValue = stat.decimals ? Number(currentValue.toFixed(stat.decimals)) : Math.round(currentValue);

              return (
                <div
                  key={stat.label}
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 transition-transform duration-300 hover:-translate-y-0.5 hover:border-blue-400/30 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex rounded-2xl bg-blue-500/10 p-3 text-blue-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white">
                    {stat.prefix}
                    {formatValue(displayValue, stat.decimals)}
                    {stat.suffix}
                  </div>
                  <p className="mt-2 text-sm text-white/64">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">Trusted by</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {trustedBy.map((item) => (
                <div
                  key={item}
                  className="flex min-h-[64px] items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm font-medium text-white/72"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">Guarantees</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {guaranteeBadges.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-sm font-medium text-white/88"
                >
                  <Icon className="h-4 w-4 text-blue-300" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
          {socialCards.map(({ title, subtitle, body, icon: Icon }) => (
            <div
              key={title}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 transition-colors duration-300 hover:border-blue-400/25 hover:bg-white/[0.05]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/45">{subtitle}</p>
                </div>
                <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/68">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
