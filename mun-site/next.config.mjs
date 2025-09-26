/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don’t fail production build on ESLint problems
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don’t fail production build on type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;