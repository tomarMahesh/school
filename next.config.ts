import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Gallery photo uploads submit an already-cropped image as multipart
    // form data through a Server Action; the 1MB default is too small.
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
