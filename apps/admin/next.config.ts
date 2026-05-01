import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const here = path.dirname(fileURLToPath(import.meta.url));

const config: NextConfig = {
  outputFileTracingRoot: path.resolve(here, '..', '..'),
  serverExternalPackages: ['@jasper-brain/core'],
};

export default config;
