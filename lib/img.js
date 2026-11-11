// Returns a resized, compressed version of a photo (served by Vercel) instead of
// the full-size original. Used for grids and covers; the lightbox asks for a
// bigger size. External images (YouTube thumbnails, etc.) are returned as-is.
const SIZES = [640, 828, 1080, 1200, 1920, 2048];

export function img(src, width = 828, quality = 75) {
  if (!src || typeof src !== 'string') return src;
  if (src.startsWith('data:') || /\.(svg|gif)(\?|$)/i.test(src)) return src;
  const isLocal = src.startsWith('/') && !src.startsWith('//');
  const isBlob = /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(src);
  if (!isLocal && !isBlob) return src;
  if (process.env.NODE_ENV !== 'production') return src;
  const w = SIZES.find((s) => s >= width) || SIZES[SIZES.length - 1];
  return `/_next/image?url=${encodeURIComponent(src.split('?')[0])}&w=${w}&q=${quality}`;
}
