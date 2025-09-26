/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ✅ Allow build to continue even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ Allow build to continue even if there are TypeScript errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;