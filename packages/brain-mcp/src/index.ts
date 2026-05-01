#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createBrainServer } from './server.js';

interface CliOptions {
  brainsRoot: string;
  defaultBrandId?: string;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: Partial<CliOptions> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if ((arg === '--root' || arg === '-r') && argv[i + 1]) {
      opts.brainsRoot = path.resolve(argv[i + 1]);
      i += 1;
    } else if ((arg === '--brand' || arg === '-b') && argv[i + 1]) {
      opts.defaultBrandId = argv[i + 1];
      i += 1;
    }
  }
  if (!opts.brainsRoot) {
    const fromEnv = process.env.BRAIN_ROOT;
    opts.brainsRoot = fromEnv
      ? path.resolve(fromEnv)
      : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../brands');
  }
  if (!opts.defaultBrandId && process.env.BRAIN_BRAND) {
    opts.defaultBrandId = process.env.BRAIN_BRAND;
  }
  return opts as CliOptions;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const server = createBrainServer(options);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('[brain-mcp] fatal:', err);
  process.exit(1);
});
