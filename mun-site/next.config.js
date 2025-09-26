/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ❌ ignore all lint errors
  },
  typescript: {
    ignoreBuildErrors: true, // ❌ ignore TS build errors
  },
};

module.exports = nextConfig;