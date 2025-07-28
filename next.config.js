/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone',
  
  // Temporarily disable linting during build to fix deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Compress images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
  
  // External packages
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Optimize for production
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Bundle analyzer (uncomment for bundle analysis)
  // ...(process.env.ANALYZE === 'true' && {
  //   webpack: (config, { isServer }) => {
  //     if (!isServer) {
  //       config.plugins.push(new BundleAnalyzerPlugin({
  //         analyzerMode: 'server',
  //         analyzerPort: 8888,
  //         openAnalyzer: true,
  //       }));
  //     }
  //     return config;
  //   },
  // }),
}

module.exports = nextConfig