import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const here = path.dirname(fileURLToPath(import.meta.url));

const repoRoot = path.resolve(here, '..', '..');

const config: NextConfig = {
  outputFileTracingRoot: repoRoot,
  // Include the seed `brands/` directory in EVERY function bundle so
  // the boot-hook seed-sync, the data-migration code path, and the
  // /brands/import action can all read filesystem brands at runtime.
  //
  // Next.js's `*` key wildcard wasn't reliable across all routes for
  // us — the migration was silently skipping templates because
  // findBrandsDir() returned null in the bundle that fired the boot
  // hook. Explicit globs per route family make the intent unambiguous.
  outputFileTracingIncludes: {
    '/': ['../../brands/**'],
    '/api/(.*)': ['../../brands/**'],
    '/brands/(.*)': ['../../brands/**'],
    '/share/(.*)': ['../../brands/**'],
  },
  serverExternalPackages: ['@jasper-brain/core'],
  experimental: {
    // Default is 1MB. Bulk illustration uploads are batched on the
    // client into ~3MB chunks; this keeps Next.js out of the way.
    // Vercel's serverless POST cap (4.5MB on Hobby/Pro) still applies,
    // which is why client-side batching is the real fix.
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default config;
