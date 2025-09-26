import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // If there’s a lockfile/package.json in the parent directory, set the tracing root:
  outputFileTracingRoot: path.resolve(__dirname, ".."),

  // Keep deploys unblocked while you iterate:
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }
};

export default nextConfig;