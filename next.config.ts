import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['www.decorilla.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thumbs.dreamstime.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.hdqwalls.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.multivu.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tse3.mm.bing.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tse1.mm.bing.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a.cdn-hotels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.decorilla.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
