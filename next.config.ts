import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "uploadthing.com" },
      { hostname: "utfs.io" },
    ],
  },
  outputFileTracingIncludes: {
    "/api/agent": ["./just-ai-agent/just-ai-skills/**/SKILL.md"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
};

export default nextConfig;
