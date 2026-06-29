import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nook/types", "@nook/api"],
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
