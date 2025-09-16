import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'limitlesstcg.nyc3.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
