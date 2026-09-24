
import type { NextConfig } from "next";
import dns from 'node:dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
