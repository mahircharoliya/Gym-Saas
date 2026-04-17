import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip type checking and linting during build (handled in CI separately)
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Prevent Prisma from being bundled into edge runtime
  serverExternalPackages: ["@prisma/client", "prisma", "authorizenet", "nodemailer"],

  experimental: {
    // Ensure API routes are treated as server-side only
  },
};

export default nextConfig;
