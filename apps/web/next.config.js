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
  
  // Webpack configuration to prevent worker thread issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'pino-pretty', 'lokijs', 'encoding'];
    }
    return config;
  },

  // Turbopack configuration to match Webpack externals
  experimental: {
    turbo: {
      resolveAlias: {
        'pino-pretty': 'empty-module',
        'lokijs': 'empty-module',
        'encoding': 'empty-module',
      },
    },
  },
};

export default nextConfig;
