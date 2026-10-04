import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // E2E tests build into their own directory so they never collide with a running dev server.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // The Docker image runs the minimal standalone server; `pnpm start` keeps using `next start`.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  poweredByHeader: false,
};

export default nextConfig;
