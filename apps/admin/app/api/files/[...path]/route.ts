import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { blobBackend, detectMime, signedBlobUrl } from '@/lib/blob';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function brandsRoot(): string {
  return process.env.BRAIN_ROOT
    ? path.resolve(process.env.BRAIN_ROOT)
    : path.resolve(process.cwd(), '..', '..', 'brands');
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;
  if (parts.length < 2) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Vercel Blob (private) mode — fetch the blob server-side using the
  // env-injected BLOB_READ_WRITE_TOKEN and stream the bytes back. Avoids
  // signed-URL redirect quirks (expiry, CORS, image-load edge cases).
  if (blobBackend() === 'vercel') {
    const blobPath = parts.join('/');
    const fresh = await signedBlobUrl(blobPath);
    if (!fresh) {
      return new NextResponse(`Not found: ${blobPath}`, { status: 404 });
    }
    let upstream: Response;
    try {
      upstream = await fetch(fresh, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'fetch failed';
      console.error('[api/files] upstream fetch threw:', message, fresh);
      return new NextResponse(`Upstream fetch threw: ${message}`, {
        status: 502,
      });
    }
    if (!upstream.ok || !upstream.body) {
      const detail = `${upstream.status} ${upstream.statusText}`;
      const peek = await upstream.text().catch(() => '<no body>');
      console.error('[api/files] upstream non-OK:', detail, peek.slice(0, 200), fresh);
      return new NextResponse(
        `Upstream non-OK: ${detail} — ${peek.slice(0, 200)}`,
        { status: 502 },
      );
    }
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'content-type':
          upstream.headers.get('content-type') ?? detectMime(blobPath),
        'cache-control': 'public, max-age=3600',
      },
    });
  }

  // Local-fs mode — /api/files/<brandId>/<file> reads brands/<id>/uploads/<file>.
  const [brandId, ...rest] = parts;
  if (!brandId || rest.length === 0) {
    return new NextResponse('Not found', { status: 404 });
  }

  const root = brandsRoot();
  const expectedPrefix = path.join(root, brandId, 'uploads') + path.sep;
  const target = path.normalize(path.join(root, brandId, 'uploads', ...rest));

  if (!target.startsWith(expectedPrefix)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const data = await fs.readFile(target);
    return new NextResponse(data, {
      headers: {
        'content-type': detectMime(target),
        'cache-control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return new NextResponse('Not found', { status: 404 });
    }
    throw err;
  }
}
