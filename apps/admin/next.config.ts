import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const here = path.dirname(fileURLToPath(import.meta.url));

const repoRoot = path.resolve(here, '..', '..');

const config: NextConfig = {
  outputFileTracingRoot: repoRoot,
  // Include the seed `brands/` directory in every function bundle so
  // both the /brands/import flow AND the boot-hook auto-sync (in
  // instrumentation.ts) can read filesystem brands on Vercel. The
  // glob applies to all routes; cost is small (markdown only).
  outputFileTracingIncludes: {
    '*': ['../../brands/**'],
    '/brands/import': ['../../brands/**'],
    '/brands/import/**': ['../../brands/**'],
  },
  serverExternalPackages: ['@jasper-brain/core'],
};

export default config;
