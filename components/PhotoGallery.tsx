'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, X } from 'lucide-react';
import { shimmerDataURL } from '@/lib/image-utils';
import { derivePhotoVariants, getGalleryChunkSize, getGalleryInitialCount } from '@/lib/photo-variants';

interface PhotoGalleryProps {
  photos: string[];
  title: string;
}

export default function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const gallery = useMemo(
    () => photos.filter((p) => typeof p === 'string' && p.trim().length > 0),
    [photos]
  );
  const total = gallery.length;
  const initialVisible = useMemo(() => getGalleryInitialCount(total), [total]);
  const [visibleCount, setVisibleCount] = useState(initialVisible);

  useEffect(() => {
    setVisibleCount(initialVisible);
  }, [initialVisible]);

  const visibleGallery = useMemo(() => gallery.slice(0, visibleCount), [gallery, visibleCount]);
  const totalVisible = visibleGallery.length;
  const blurPlaceholder = useMemo(() => shimmerDataURL(1400, 900), []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(totalVisible - 1, 0)));
    setLightboxIndex((index) => Math.min(index, Math.max(totalVisible - 1, 0)));
  }, [totalVisible]);

  // ─── Main carousel scroll tracking ───────────────────────────────────────
  const carouselRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isScrolling = useRef(false);

  const scrollToSlide = useCallback((index: number) => {
    const el = carouselRef.current;
    if (!el) return;
    isScrolling.current = true;
    el.scrollTo({ left: el.clientWidth * index, behavior: 'smooth' });
    setActiveIndex(index);
    // Scroll active thumb into view
    const thumb = thumbRefs.current[index];
    if (thumb && thumbsRef.current) {
      thumbsRef.current.scrollTo({
        left: thumb.offsetLeft - thumbsRef.current.clientWidth / 2 + thumb.clientWidth / 2,
        behavior: 'smooth',
      });
    }
    setTimeout(() => { isScrolling.current = false; }, 600);
  }, []);

  // Sync counter when user natively swipes
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => {
      if (isScrolling.current) return;
      const newIndex = Math.round(el.scrollLeft / el.clientWidth);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
        const thumb = thumbRefs.current[newIndex];
        if (thumb && thumbsRef.current) {
          thumbsRef.current.scrollTo({
            left: thumb.offsetLeft - thumbsRef.current.clientWidth / 2 + thumb.clientWidth / 2,
            behavior: 'smooth',
          });
        }
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [activeIndex]);

  // ─── Lightbox ─────────────────────────────────────────────────────────────
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const lbPrev = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + totalVisible) % totalVisible);
  }, [totalVisible]);

  const lbNext = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % totalVisible);
  }, [totalVisible]);

  // Keyboard nav
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lbPrev();
      if (e.key === 'ArrowRight') lbNext();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxOpen, lbPrev, lbNext, closeLightbox]);

  // Lightbox touch swipe
  const lbTouchStartX = useRef<number | null>(null);
  const handleLbTouchStart = (clientX: number) => { lbTouchStartX.current = clientX; };
  const handleLbTouchEnd = (clientX: number) => {
    if (lbTouchStartX.current === null) return;
    const delta = lbTouchStartX.current - clientX;
    if (Math.abs(delta) > 40) {
      if (delta > 0) lbNext(); else lbPrev();
    }
    lbTouchStartX.current = null;
  };

  if (!total) return null;

  return (
    <>
      {/* ── Main gallery ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Carousel */}
        <div className="relative overflow-hidden rounded-2xl bg-black shadow-xl">
          {/* Scrollable strip */}
          <div
            ref={carouselRef}
            className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {visibleGallery.map((src, i) => {
              const variants = derivePhotoVariants(src);
              return (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  aria-label={`View photo ${i + 1} fullscreen`}
                  onClick={() => openLightbox(i)}
                  className="relative aspect-[4/3] w-full shrink-0 snap-start sm:aspect-[16/9]"
                  style={{ minWidth: '100%' }}
                >
                  <Image
                    src={variants.medium}
                    alt={`${title} — photo ${i + 1}`}
                    fill
                    priority={i === 0}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    placeholder="blur"
                    blurDataURL={blurPlaceholder}
                    sizes="(max-width: 768px) 100vw, 80vw"
                    className="object-cover"
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>

          {/* Prev / Next arrows */}
          {totalVisible > 1 && activeIndex > 0 && (
            <button
              type="button"
              onClick={() => scrollToSlide(activeIndex - 1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70 active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          {totalVisible > 1 && activeIndex < totalVisible - 1 && (
            <button
              type="button"
              onClick={() => scrollToSlide(activeIndex + 1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70 active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}

          {/* Photo counter */}
          {totalVisible > 1 && (
            <div className="pointer-events-none absolute bottom-3 right-3">
              <div className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {activeIndex + 1} / {totalVisible}
              </div>
            </div>
          )}

          {/* View all photos button (bottom-left) */}
          {totalVisible > 1 && (
            <button
              type="button"
              onClick={() => openLightbox(0)}
              className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/80 active:scale-95"
              aria-label={`View all ${totalVisible} loaded photos`}
            >
              View all {totalVisible} photos
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {totalVisible > 1 && (
          <>
            <div
              ref={thumbsRef}
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
            >
              {visibleGallery.map((src, i) => {
                const isActive = i === activeIndex;
                const variants = derivePhotoVariants(src);
                return (
                  <button
                    key={`thumb-${src}-${i}`}
                    ref={(el) => { thumbRefs.current[i] = el; }}
                    type="button"
                    aria-label={`View photo ${i + 1}`}
                    aria-pressed={isActive}
                    onClick={() => scrollToSlide(i)}
                    className={`relative h-[68px] w-[88px] shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:h-20 sm:w-[108px] ${
                      isActive
                        ? 'border-blue-500 opacity-100 shadow-md shadow-blue-500/30'
                        : 'border-transparent opacity-60 hover:opacity-90'
                    }`}
                  >
                    <Image
                      src={variants.thumb}
                      alt={`${title} thumbnail ${i + 1}`}
                      fill
                      sizes="108px"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL={blurPlaceholder}
                      className="object-cover"
                      draggable={false}
                    />
                    {isActive && (
                      <div className="absolute inset-0 ring-2 ring-inset ring-blue-500 rounded-[10px]" />
                    )}
                  </button>
                );
              })}
            </div>
            {visibleCount < total && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => Math.min(total, count + getGalleryChunkSize()))}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                >
                  <ChevronDown className="h-4 w-4" />
                  Show more photos ({total - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Lightbox ───────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col bg-black"
          onTouchStart={(e) => handleLbTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleLbTouchEnd(e.changedTouches[0].clientX)}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <span className="text-sm font-semibold text-white/80">
              {lightboxIndex + 1} / {totalVisible}
            </span>
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close fullscreen gallery"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Full-screen image */}
          <div className="relative flex-1">
            <Image
              src={derivePhotoVariants(visibleGallery[lightboxIndex]).full}
              alt={`${title} — fullscreen photo ${lightboxIndex + 1}`}
              fill
              sizes="100vw"
              priority
              placeholder="blur"
              blurDataURL={blurPlaceholder}
              className="object-contain"
              draggable={false}
            />

            {/* Prev / Next — desktop */}
            {totalVisible > 1 && (
              <>
                <button
                  type="button"
                  onClick={lbPrev}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25 sm:flex"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button
                  type="button"
                  onClick={lbNext}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25 sm:flex"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </>
            )}
          </div>

          {/* Lightbox thumbnail strip */}
          {totalVisible > 1 && (
            <div
              className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
            >
              {visibleGallery.map((src, i) => {
                const isActive = i === lightboxIndex;
                const variants = derivePhotoVariants(src);
                return (
                  <button
                    key={`lb-thumb-${src}-${i}`}
                    type="button"
                    aria-label={`Go to photo ${i + 1}`}
                    aria-pressed={isActive}
                    onClick={() => setLightboxIndex(i)}
                    className={`relative h-14 w-[72px] shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150 sm:h-16 sm:w-[88px] ${
                      isActive
                        ? 'border-white opacity-100'
                        : 'border-transparent opacity-40 hover:opacity-80'
                    }`}
                  >
                    <Image
                      src={variants.thumb}
                      alt={`${title} lightbox thumbnail ${i + 1}`}
                      fill
                      sizes="88px"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL={blurPlaceholder}
                      className="object-cover"
                      draggable={false}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
