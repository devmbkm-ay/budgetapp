// Root-level entry point for API - solves module resolution issues
import('./apps/api/index.ts').catch((err) => {
    console.error('Failed to start API:', err);
    process.exit(1);
});
