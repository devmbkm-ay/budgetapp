/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output as standalone to avoid .next prerendering issues
  output: 'standalone',
  
  // Disable automatic static optimization
  staticPageGenerationTimeout: 120,
  
  // Production configuration
  typescript: {
    // Don't fail build on type errors
    ignoreBuildErrors: false,
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'pino-pretty', 'lokijs', 'encoding'];
    }
    return config;
  },

  // Fix for Next.js 16 Turbopack build error
  turbopack: {},
};

export default nextConfig;
