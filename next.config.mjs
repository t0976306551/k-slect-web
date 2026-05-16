/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...(process.env.NODE_ENV === 'development'
        ? [{ protocol: 'http', hostname: 'localhost', port: '3847' }]
        : []),
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'k-slect.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'pub-8c6dbf25ccea457a9bbbd25d35ea8a48.r2.dev' },
    ],
  },
  async rewrites() {
    const backendBase = (process.env.BACKEND_URL ?? 'http://localhost:3847/api').replace(/\/api$/, '')
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendBase}/uploads/:path*`,
      },
    ]
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
