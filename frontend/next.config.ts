import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // for optimal performance in containerized environments
  images: {
    // backend already resizes uploads to webp; the optimizer would also have to fetch
    // localhost:8000 from inside the frontend container, which fails in docker
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      // image uploads pass through a server action; matches the form's 5 files x 10MB + form overhead
      bodySizeLimit: "55mb",
    },
  },
};

export default nextConfig;
