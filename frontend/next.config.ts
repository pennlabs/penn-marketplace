import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // for optimal performance in containerized environments
  images: {
    // dev serves uploads from localhost:8000, which the optimizer can't reach from inside
    // the frontend container; production images come from S3 and get optimized
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        // TODO: pin to the production bucket's hostname once Platform creates it
        hostname: "*.s3.amazonaws.com",
        pathname: "/marketplace/images/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // one image per upload request, 10MB for image + 1MB for headroom
      bodySizeLimit: "11mb",
    },
  },
  async redirects() {
    return [{ source: "/", destination: "/items", permanent: false }];
  },
};

export default nextConfig;
