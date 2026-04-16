import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Enable standalone output for Docker deployment
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "srms-backend.test",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "srms-backend.test",
        pathname: "/storage/**",
      },
    ],
  },
  experimental: {
    turbo: {
      resolveExtensions: [
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
      ],
    },
  },
};

export default nextConfig;
