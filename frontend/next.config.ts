import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Keep the dev-only "N" badge away from the sidebar's bottom-left controls.
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
