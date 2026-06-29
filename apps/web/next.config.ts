import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nook/types"],
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
