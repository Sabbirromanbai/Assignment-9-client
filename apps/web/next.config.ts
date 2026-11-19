import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
}

export default nextConfig
