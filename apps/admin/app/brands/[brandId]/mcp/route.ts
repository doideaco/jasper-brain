import { createBrainServer } from '@jasper-brain/mcp';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';
import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface JSONRPCRequestLike {
  jsonrpc?: '2.0';
  id?: string | number;
  method?: string;
  params?: unknown;
}

const PROTOCOL_VERSION = '2024-11-05';
const PARSE_ERROR = -32700;
const NOT_FOUND_ERROR = -32602;
const INTERNAL_ERROR = -32603;

function rpcError(id: unknown, code: number, message: string, status = 200) {
  return NextResponse.json(
    { jsonrpc: '2.0', id: id ?? null, error: { code, message } },
    { status },
  );
}

function isResponseFor(message: unknown, id: unknown): boolean {
  return (
    typeof message === 'object' &&
    message !== null &&
    'id' in message &&
    (message as { id: unknown }).id === id
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ brandId: string }> },
) {
  const { brandId } = await params;

  let body: JSONRPCRequestLike;
  try {
    body = (await req.json()) as JSONRPCRequestLike;
  } catch {
    return rpcError(null, PARSE_ERROR, 'Invalid JSON');
  }

  const store = await getStore();
  try {
    await store.getBrand(brandId);
  } catch {
    return rpcError(body.id, NOT_FOUND_ERROR, `Brand not found: ${brandId}`, 404);
  }

  const server = createBrainServer({ store, defaultBrandId: brandId });
  const [serverTransport, clientTransport] =
    InMemoryTransport.createLinkedPair();

  try {
    await server.connect(serverTransport);

    // Auto-initialize so callers can hit any tool in a single POST without a
    // prior handshake. This makes the endpoint stateless: every request
    // gets a fresh server that is already past the init step.
    await primeInitialize(clientTransport);

    if (body.method === 'initialize') {
      // Caller wanted to init explicitly; reply with our handshake response.
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id ?? null,
        result: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: 'jasper-brain', version: '0.0.1' },
        },
      });
    }

    if (body.method === 'notifications/initialized') {
      return new NextResponse(null, { status: 204 });
    }

    // Notifications: send and return 204
    if (body.id === undefined) {
      await clientTransport.send(body as JSONRPCMessage);
      return new NextResponse(null, { status: 204 });
    }

    // Requests: send and wait for response with matching id
    const responsePromise = new Promise<JSONRPCMessage>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('MCP request timed out after 30s')),
        30000,
      );
      clientTransport.onmessage = (message) => {
        if (isResponseFor(message, body.id)) {
          clearTimeout(timeout);
          resolve(message);
        }
      };
      clientTransport.onerror = (err) => {
        clearTimeout(timeout);
        reject(err);
      };
      void clientTransport.send(body as JSONRPCMessage).catch((err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    const response = await responsePromise;
    return NextResponse.json(response);
  } catch (err) {
    return rpcError(
      body.id,
      INTERNAL_ERROR,
      err instanceof Error ? err.message : 'Internal error',
      500,
    );
  } finally {
    await server.close().catch(() => {});
    await serverTransport.close().catch(() => {});
    await clientTransport.close().catch(() => {});
  }
}

export function GET() {
  return NextResponse.json({
    name: 'jasper-brain',
    transport: 'stateless-http',
    protocolVersion: PROTOCOL_VERSION,
    note: 'POST a JSON-RPC 2.0 message. The endpoint is stateless — call any tool in a single POST without a prior initialize handshake.',
  });
}

/**
 * Send the initialize handshake on behalf of the caller so subsequent tool
 * calls don't need it. Discards the response.
 */
async function primeInitialize(
  clientTransport: InMemoryTransport,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('initialize timed out')),
      5000,
    );
    const previous = clientTransport.onmessage;
    clientTransport.onmessage = (message) => {
      if (isResponseFor(message, 'init')) {
        clearTimeout(timeout);
        clientTransport.onmessage = previous;
        // Send the initialized notification — fire and forget
        void clientTransport
          .send({
            jsonrpc: '2.0',
            method: 'notifications/initialized',
          } as JSONRPCMessage)
          .then(() => resolve())
          .catch(reject);
      }
    };
    void clientTransport
      .send({
        jsonrpc: '2.0',
        id: 'init',
        method: 'initialize',
        params: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: 'jasper-brain-http', version: '0.0.1' },
        },
      } as JSONRPCMessage)
      .catch(reject);
  });
}
