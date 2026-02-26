import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Pacotes que precisam rodar no Node.js (não no edge) */
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
