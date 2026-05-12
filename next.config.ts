// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'tile.openstreetmap.org' },
      { protocol: 'https', hostname: 'flagcdn.com' },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.API_URL || 'http://localhost:8000/api/v1'
    return [
      { source: '/api/backend/:path*', destination: `${apiUrl}/:path*` },
    ]
  },
}

export default nextConfig