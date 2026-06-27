import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained build for a small Docker runtime image.
  output: "standalone",
  // Keep native / non-bundleable server-only packages out of the bundle trace.
  // `better-sqlite3` is a native addon; `ipp` is CommonJS with dynamic requires.
  serverExternalPackages: ["better-sqlite3", "ipp"],
};

export default nextConfig;
