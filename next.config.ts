import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // E2E tests build into their own directory so they never collide with a running dev server.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  poweredByHeader: false,
};

export default nextConfig;
