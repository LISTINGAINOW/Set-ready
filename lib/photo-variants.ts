// Photo variant utilities for gallery display

export interface PhotoVariantSet {
  original: string;
  full: string;
  medium: string;
  thumb: string;
  thumbnail: string;
}

export function derivePhotoVariants(photos: string | string[]): PhotoVariantSet {
  const src = Array.isArray(photos) ? photos[0] || '' : photos;
  return { original: src, full: src, medium: src, thumb: src, thumbnail: src };
}

export function getGalleryChunkSize(_total?: number): number {
  return 12;
}

export function getGalleryInitialCount(_total?: number): number {
  return 6;
}
