import type { NextConfig } from "next"

// Keep Better Auth on the frontend origin so browsers treat its session cookie
// as first-party, including in Incognito mode with third-party cookies blocked.
const authBackendURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${authBackendURL}/api/auth/:path*`,
      },
    ]
  },
  images: {
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
}

export default nextConfig
