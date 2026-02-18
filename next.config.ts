import type { NextConfig } from "next";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexHostname = convexUrl ? new URL(convexUrl).hostname : undefined;

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: convexHostname!,
      },
    ],
  },
};

export default nextConfig;
