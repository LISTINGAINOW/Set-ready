'use client';

import { useState } from 'react';
import Image from 'next/image';

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
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        style={{ backgroundColor: '#1a1a1a' }}
        onError={() => setFailed(true)}
      />
    </>
  );
}
