import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const here = path.dirname(fileURLToPath(import.meta.url));

const repoRoot = path.resolve(here, '..', '..');

const config: NextConfig = {
  outputFileTracingRoot: repoRoot,
  // Include the seed `brands/` directory in the function bundle so the
  // /brands/import flow can read filesystem brands on Vercel.
  outputFileTracingIncludes: {
    '/brands/import': ['../../brands/**'],
    '/brands/import/**': ['../../brands/**'],
  },
  serverExternalPackages: ['@jasper-brain/core'],
};

export default config;
