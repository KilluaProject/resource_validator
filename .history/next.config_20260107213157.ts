/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000/:path*' // Arah ke Python local saat dev
            : '/api/', // Arah ke Vercel saat prod
      },
    ]
  },
}

module.exports = nextConfig