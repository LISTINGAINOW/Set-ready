// Shimmer placeholder for Next.js Image blurDataURL
export function shimmerDataURL(w: number = 700, h: number = 475): string {
  const shimmer = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${h}" fill="#e2e8f0"/>
    </svg>`;
  return `data:image/svg+xml;base64,${typeof Buffer !== 'undefined' ? Buffer.from(shimmer).toString('base64') : btoa(shimmer)}`;
}
