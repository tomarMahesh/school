import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const noIndex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Gallery photo uploads submit an already-cropped image as multipart
    // form data through a Server Action; the 1MB default is too small.
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Private areas must never show up in search results.
      ...["/admin/:path*", "/portal/:path*", "/api/:path*", "/set-password", "/forgot-password"].map(
        (source) => ({ source, headers: noIndex }),
      ),
    ];
  },
};

export default nextConfig;
