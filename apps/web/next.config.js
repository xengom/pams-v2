;;/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@pams/types'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:8787/:path*'
          : 'https://pams-api.your-domain.workers.dev/:path*',
      },
    ];
  },
}

module.exports = nextConfig;