import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.platform === "win32" ? {} : { output: "standalone" as const }),
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["@shared/api-contracts"],
};

export default nextConfig;
