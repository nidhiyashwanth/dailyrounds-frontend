import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['*'],
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
