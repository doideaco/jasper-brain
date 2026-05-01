import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FilesystemStore, type WritableBrainStore } from '@jasper-brain/core';
import { createBrainServer } from '@jasper-brain/mcp';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(here, '../../../brands');

interface RouteMatch {
  endpoint: 'root' | 'brands' | 'brand' | 'mcp' | 'unknown';
  brandId?: string;
}

function matchRoute(rawUrl: string): RouteMatch {
  const pathname = new URL(rawUrl, 'http://placeholder').pathname.replace(/\/$/, '') || '/';
  if (pathname === '/') return { endpoint: 'root' };
  if (pathname === '/brands') return { endpoint: 'brands' };
  const mcp = pathname.match(/^\/brands\/([^/]+)\/mcp$/);
  if (mcp) return { endpoint: 'mcp', brandId: mcp[1] };
  const brand = pathname.match(/^\/brands\/([^/]+)$/);
  if (brand) return { endpoint: 'brand', brandId: brand[1] };
  return { endpoint: 'unknown' };
}

let cachedStore: WritableBrainStore | null = null;
let initPromise: Promise<WritableBrainStore> | null = null;

async function getStore(): Promise<WritableBrainStore> {
  if (cachedStore) return cachedStore;
  if (!initPromise) {
    initPromise = (async () => {
      if (process.env.DATABASE_URL) {
        const { PostgresStore } = await import('@jasper-brain/store-postgres');
        cachedStore = new PostgresStore(process.env.DATABASE_URL);
      } else {
        const root = process.env.BRAIN_ROOT
          ? path.resolve(process.env.BRAIN_ROOT)
          : DEFAULT_ROOT;
        cachedStore = new FilesystemStore(root);
      }
      return cachedStore;
    })();
  }
  return initPromise;
}

export async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const route = matchRoute(req.url ?? '/');

  try {
    if (route.endpoint === 'root') {
      return json(res, 200, {
        name: 'Jasper Brain',
        description: 'Brand knowledge & context layer, exposed over MCP.',
        endpoints: {
          listBrands: '/brands',
          brand: '/brands/:brandId',
          mcp: '/brands/:brandId/mcp',
        },
      });
    }

    if (route.endpoint === 'brands') {
      const store = await getStore();
      const brands = await store.listBrands();
      return json(res, 200, { brands });
    }

    if (route.endpoint === 'brand' && route.brandId) {
      const store = await getStore();
      const brand = await store.getBrand(route.brandId);
      const artifacts = await store.listArtifacts(route.brandId);
      return json(res, 200, {
        brand,
        artifacts: artifacts.map((a) => ({
          type: a.type,
          id: a.id,
          name: a.name,
          description: a.description,
          tags: a.tags,
        })),
      });
    }

    if (route.endpoint === 'mcp' && route.brandId) {
      return handleMcp(req, res, route.brandId);
    }

    return json(res, 404, { error: 'Not found', path: req.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    if (/not found/i.test(message)) {
      return json(res, 404, { error: message });
    }
    return json(res, 500, { error: message });
  }
}

async function handleMcp(
  req: IncomingMessage,
  res: ServerResponse,
  brandId: string,
): Promise<void> {
  const store = await getStore();
  await store.getBrand(brandId);
  const server = createBrainServer({ store, defaultBrandId: brandId });
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => {
    void transport.close();
    void server.close();
  });
  await server.connect(transport);
  const body = await readBody(req);
  await transport.handleRequest(req, res, body);
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body, null, 2));
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  if (req.method === 'GET' || req.method === 'DELETE' || req.method === 'HEAD') {
    return undefined;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  if (!chunks.length) return undefined;
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default handler;
