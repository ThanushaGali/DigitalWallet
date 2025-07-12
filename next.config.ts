import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/DigitalWallet' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/DigitalWallet/' : '',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.hdqwalls.com',
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
        hostname: 'cdn.pixabay.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.decorilla.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a.cdn-hotels.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
