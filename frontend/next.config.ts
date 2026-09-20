import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // for optimal performance in containerized environments
  images: {
    remotePatterns: [
      // listing images served by Django in development
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/media/**" },
    ],
  },
};

export default nextConfig;
