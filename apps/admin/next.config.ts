import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  async redirects() {
    return [
      { source: '/', destination: '/sign-in', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: '*.nataquashop.com',
      },
    ],
  },
};

export default nextConfig;
