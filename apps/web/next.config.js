;;/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@pams/types'],
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:8787/:path*'
          : 'https://pams-api.xengom.workers.dev/:path*',
      },
    ];
  },
}

module.exports = nextConfig;