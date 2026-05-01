import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { detectMime } from '@/lib/blob';

export const dynamic = 'force-dynamic';

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
