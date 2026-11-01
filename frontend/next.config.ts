import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // for optimal performance in containerized environments
  /* config options here */
  async redirects() {
    return [{ source: "/", destination: "/items", permanent: false }];
  }
};

export default nextConfig;
