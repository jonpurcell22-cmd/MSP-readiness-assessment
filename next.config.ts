import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  generateBuildId: async () => {
    return Date.now().toString()
  },
};

export default nextConfig;
