import type { NextConfig } from "next";

// The browser calls this site's /api, forwarded here to the backend, so the sign-in cookie is first-party.
const BACKEND_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Keep the dev-only "N" badge away from the sidebar's bottom-left controls.
  devIndicators: { position: "bottom-right" },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
