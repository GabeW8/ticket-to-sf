import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ticket-to-sf",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
