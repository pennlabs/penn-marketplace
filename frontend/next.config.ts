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
      // image uploads pass through a server action; matches the form's 5 files x 10MB + form overhead
      bodySizeLimit: "55mb",
    },
  },
};

export default nextConfig;
