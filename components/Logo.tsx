import type { CSSProperties } from 'react';
import Link from 'next/link';

type LogoProps = {
  href?: string;
  className?: string;
  iconOnly?: boolean;
  dark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
};

const sizeMap = {
  sm: {
    icon: 'h-8 w-8 rounded-xl',
    ring: 'h-3 w-3',
    wordmark: 'text-base',
    tagline: 'text-[9px]',
    gap: 'gap-2.5',
  },
  md: {
    icon: 'h-10 w-10 rounded-2xl',
    ring: 'h-3.5 w-3.5',
    wordmark: 'text-lg sm:text-xl',
    tagline: 'text-[10px] sm:text-[11px]',
    gap: 'gap-3',
  },
  lg: {
    icon: 'h-12 w-12 rounded-[20px]',
    ring: 'h-4 w-4',
    wordmark: 'text-xl sm:text-2xl',
    tagline: 'text-[11px] sm:text-xs',
    gap: 'gap-3.5',
  },
} as const;

function LogoMark({ dark = false, size = 'md' }: Pick<LogoProps, 'dark' | 'size'>) {
  const palette = dark
    ? {
        shell: 'bg-white/[0.08] border-white/12',
        text: 'text-white',
        line: 'bg-white/70',
        soft: 'bg-white/14',
      }
    : {
        shell: 'bg-slate-950 border-slate-900/10',
        text: 'text-white',
        line: 'bg-white/80',
        soft: 'bg-white/14',
      };

  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center border shadow-[0_12px_32px_rgba(15,23,42,0.14)] ${sizeMap[size].icon} ${palette.shell} ${palette.text}`}
    >
      <span className={`absolute right-1.5 top-1.5 rounded-full bg-[#3B82F6] ${sizeMap[size].ring}`} />
      <span className="relative flex items-center gap-[3px]">
        <span className={`h-4 w-[2px] rounded-full ${palette.line}`} />
        <span className={`h-4 w-[2px] rounded-full ${palette.line}`} style={{ opacity: 0.42 } satisfies CSSProperties} />
      </span>
      <span className={`absolute inset-x-[28%] bottom-[26%] h-[2px] rounded-full ${palette.soft}`} />
    </span>
  );
}

function LogoInner({ iconOnly = false, dark = false, size = 'md', showTagline = false, className = '' }: Omit<LogoProps, 'href'>) {
  const textColor = dark ? 'text-white' : 'text-slate-950';
  const mutedColor = dark ? 'text-white/58' : 'text-slate-500';

  return (
    <span className={`inline-flex items-center ${sizeMap[size].gap} ${className}`.trim()}>
      <LogoMark dark={dark} size={size} />
      {!iconOnly ? (
        <span className="min-w-0 leading-none">
          <span className={`block truncate font-semibold tracking-[-0.055em] ${sizeMap[size].wordmark} ${textColor}`}>
            Set<span className="text-[#3B82F6]">Venue</span>
          </span>
          {showTagline ? (
            <span className={`mt-1 block uppercase tracking-[0.22em] ${sizeMap[size].tagline} ${mutedColor}`}>
              Locations • Stays • Events
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

export default function Logo({ href, ...props }: LogoProps) {
  if (href) {
    return (
      <Link href={href} className="inline-flex min-w-0 items-center">
        <LogoInner {...props} />
      </Link>
    );
  }

  return <LogoInner {...props} />;
}

export { LogoMark };
