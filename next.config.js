/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Vercel resizes photos to the size each screen needs, so pages load fast.
    remotePatterns: [{ protocol: 'https', hostname: '**.public.blob.vercel-storage.com' }],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400,
  },
};

module.exports = nextConfig;
