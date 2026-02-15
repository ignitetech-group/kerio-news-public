import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Enable standalone output for Docker
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async rewrites() {
    return [
      // Strip .php extension (PublicIpHelper.php → PublicIpHelper)
      {
        source: '/:path*.php',
        destination: '/:path*',
      },
      // Strip .html extension (all.html → all)
      {
        source: '/:path*.html',
        destination: '/:path*',
      },
    ];
  },
};

export default nextConfig;
