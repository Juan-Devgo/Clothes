import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compress: true,
  cacheComponents: true,
  experimental: {
    optimizePackageImports: ['react-hot-toast', 'zod', 'qs'],
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
