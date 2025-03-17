/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // 禁用 ESLint 检查
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
