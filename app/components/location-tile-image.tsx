'use client';

import { useState } from 'react';

export function LocationTileImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className="absolute inset-0 bg-[#1a1a1a]" aria-hidden="true" />;
  }

  return (
    <>
      <div className="absolute inset-0 bg-[#1a1a1a]" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        style={{ backgroundColor: '#1a1a1a' }}
        onError={() => setFailed(true)}
      />
    </>
  );
}
