/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'k-slect.com' },
    ],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
    serverComponentsExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 避免 Prisma 在 client bundle 中
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      }
    }
    return config
  },
};

export default nextConfig;
