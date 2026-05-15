/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'k-slect.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/products', destination: '/', permanent: false },
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  },
}

export default nextConfig
