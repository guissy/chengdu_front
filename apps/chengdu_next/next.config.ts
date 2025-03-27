import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["chengdu_ui"],
  experimental: {
    turbo: {
    },
  },
};

export default nextConfig;
