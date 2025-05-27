import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Set to true if you want to bypass linting errors on deploy
  },
  typescript: {
    ignoreBuildErrors: true, // Set to true ONLY if you want to bypass TS errors on deploy
  },
  images: {
    domains: ['ipfs.io', 'ipfs.w3s.link'], // Add your IPFS or other image domains
  },
};

export default nextConfig;
