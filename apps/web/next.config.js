import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output as standalone to avoid .next prerendering issues
  output: 'standalone',

  // Prevent Next.js from bundling Prisma and pg — must run as native Node.js modules
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  
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

  // Point Turbopack at the monorepo root so it can resolve shared node_modules
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
};

export default nextConfig;
