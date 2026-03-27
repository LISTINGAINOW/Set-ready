'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface PhotoGalleryProps {
  photos: string[];
  title: string;
}

const SWIPE_THRESHOLD = 48;

export default function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const gallery = useMemo(() => photos.filter((photo) => typeof photo === 'string' && photo.trim().length > 0), [photos]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);

  const totalPhotos = gallery.length;
  const currentPhoto = gallery[activeIndex] || '';
  const lightboxPhoto = lightboxIndex !== null ? gallery[lightboxIndex] : null;

  const goToIndex = (index: number) => {
    if (!totalPhotos) return;
    const nextIndex = (index + totalPhotos) % totalPhotos;
    setActiveIndex(nextIndex);
    if (lightboxIndex !== null) {
      setLightboxIndex(nextIndex);
    }
  };

  const goToPrevious = () => goToIndex((lightboxIndex ?? activeIndex) - 1);
  const goToNext = () => goToIndex((lightboxIndex ?? activeIndex) + 1);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setTouchStartX(null);
    setTouchCurrentX(null);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      }
      if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, activeIndex]);

  if (!totalPhotos) {
    return null;
  }

  const handleTouchStart = (clientX: number) => {
    setTouchStartX(clientX);
    setTouchCurrentX(clientX);
  };

  const handleTouchMove = (clientX: number) => {
    if (touchStartX === null) return;
    setTouchCurrentX(clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchCurrentX === null) {
      setTouchStartX(null);
      setTouchCurrentX(null);
      return;
    }

    const distance = touchStartX - touchCurrentX;
    if (Math.abs(distance) > SWIPE_THRESHOLD) {
      if (distance > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setTouchStartX(null);
    setTouchCurrentX(null);
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-5">
        <button
          type="button"
          onClick={() => openLightbox(activeIndex)}
          className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-black bg-white text-left shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition hover:shadow-[0_28px_80px_rgba(15,23,42,0.14)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 sm:aspect-video"
          aria-label={`Open ${title} photo ${activeIndex + 1} in fullscreen`}
        >
          <Image
            src={currentPhoto}
            alt={`${title} photo ${activeIndex + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-cover transition duration-500 group-hover:scale-[1.015]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md sm:text-sm">
            <Maximize2 className="h-4 w-4" />
            Fullscreen gallery
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="rounded-full border border-white/20 bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow-sm backdrop-blur-md">
              {activeIndex + 1} of {totalPhotos}
            </div>
            {totalPhotos > 1 && (
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToPrevious();
                  }}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/60"
                  aria-label="Show previous photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToNext();
                  }}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/60"
                  aria-label="Show next photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </button>

        {totalPhotos > 1 && (
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-full gap-3">
              {gallery.map((photo, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={`${photo}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl border transition sm:h-24 sm:w-32 ${
                      isActive
                        ? 'border-blue-500 shadow-[0_10px_30px_rgba(59,130,246,0.2)]'
                        : 'border-black/10 bg-white/70 hover:border-black/30'
                    }`}
                    aria-label={`View photo ${index + 1}`}
                    aria-pressed={isActive}
                  >
                    <Image
                      src={photo}
                      alt={`${title} thumbnail ${index + 1}`}
                      fill
                      sizes="128px"
                      className={`object-cover transition ${isActive ? 'scale-[1.03]' : 'opacity-80 hover:opacity-100'}`}
                    />
                    <div className={`absolute inset-0 transition ${isActive ? 'ring-2 ring-inset ring-blue-500' : 'bg-black/0 hover:bg-black/5'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {lightboxPhoto && lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/94 backdrop-blur-sm">
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute inset-0 cursor-default"
            aria-label="Close fullscreen gallery"
          />

          <div className="relative flex h-full flex-col">
            <div className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
                {lightboxIndex + 1} of {totalPhotos}
              </div>
              <button
                type="button"
                onClick={closeLightbox}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
                aria-label="Close fullscreen gallery"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center px-3 pb-4 sm:px-6 sm:pb-6">
              {totalPhotos > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:inline-flex"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:inline-flex"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              <div
                className="relative z-10 flex h-full w-full max-w-6xl items-center justify-center"
                onTouchStart={(event) => handleTouchStart(event.touches[0].clientX)}
                onTouchMove={(event) => handleTouchMove(event.touches[0].clientX)}
                onTouchEnd={handleTouchEnd}
              >
                <Image
                  src={lightboxPhoto}
                  alt={`${title} fullscreen photo ${lightboxIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  className="rounded-2xl object-contain shadow-[0_30px_100px_rgba(0,0,0,0.45)] transition duration-300"
                />
              </div>
            </div>

            {totalPhotos > 1 && (
              <div className="relative z-10 overflow-x-auto px-4 pb-5 sm:px-6 sm:pb-6">
                <div className="mx-auto flex w-max min-w-full gap-3">
                  {gallery.map((photo, index) => {
                    const isSelected = index === lightboxIndex;
                    return (
                      <button
                        key={`lightbox-${photo}-${index}`}
                        type="button"
                        onClick={() => goToIndex(index)}
                        className={`relative h-16 w-20 overflow-hidden rounded-2xl border transition sm:h-20 sm:w-28 ${
                          isSelected
                            ? 'border-white shadow-[0_12px_30px_rgba(255,255,255,0.18)]'
                            : 'border-white/15 opacity-70 hover:opacity-100'
                        }`}
                        aria-label={`Open photo ${index + 1}`}
                        aria-pressed={isSelected}
                      >
                        <Image
                          src={photo}
                          alt={`${title} lightbox thumbnail ${index + 1}`}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
