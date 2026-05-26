import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API do backend Lumen
  async rewrites() {
    return [
      {
        source: "/api/scanner/:path*",
        destination: `${process.env.LUMEN_API_URL || "http://localhost:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
