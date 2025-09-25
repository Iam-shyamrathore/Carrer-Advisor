/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This rewrites rule is our proxy.
  // It says "any request that comes to /api/... on the frontend server...
  // ...should be forwarded to http://localhost:4000/api/..."
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;