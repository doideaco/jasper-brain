/**
 * Token-issuing endpoint for client-side Vercel Blob uploads.
 *
 * The browser POSTs here to get a signed token, then uploads bytes
 * DIRECTLY to Blob (skipping our serverless function and its 4.5MB
 * body cap). After a successful upload, Vercel Blob calls back into
 * this same route via `onUploadCompleted` and we create the
 * Illustration item server-side at that point.
 */
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { Illustration } from '@jasper-brain/core';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ClientPayload {
  brandId: string;
  fileName: string;
  format: 'webp' | 'png' | 'svg' | 'jpg' | 'jpeg' | 'gif';
}

function illustrationIdFromFilename(name: string): string {
  const stem = name.replace(/\.[^.]+$/, '').trim();
  return (
    stem
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || `illustration-${Date.now()}`
  );
}

export async function POST(req: Request) {
  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // Auth — only signed-in users can upload.
        await requireUser();

        const payload = clientPayload
          ? (JSON.parse(clientPayload) as ClientPayload)
          : null;
        if (!payload?.brandId || !payload?.fileName) {
          throw new Error('clientPayload missing brandId / fileName');
        }

        return {
          allowedContentTypes: [
            'image/webp',
            'image/png',
            'image/svg+xml',
            'image/jpeg',
            'image/gif',
          ],
          addRandomSuffix: false,
          // Forwarded to onUploadCompleted as `tokenPayload` (string only).
          tokenPayload: JSON.stringify(payload),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload) return;
        let payload: ClientPayload;
        try {
          payload = JSON.parse(tokenPayload) as ClientPayload;
        } catch {
          console.error('[blob-upload-token] tokenPayload not JSON');
          return;
        }

        // The blob.url is Vercel Blob's direct CDN URL. We store the
        // stable /api/files/<pathname> proxy URL instead so private-mode
        // signing happens on every read and the URL doesn't change.
        const proxyUrl = `/api/files/${blob.pathname}`;

        try {
          const store = await getStore();
          const existing = await store.listArtifacts(payload.brandId, {
            facetId: 'illustration',
          });
          const existingIds = new Set(existing.map((e) => e.id));
          let id = illustrationIdFromFilename(payload.fileName);
          if (existingIds.has(id)) {
            for (let n = 2; n < 10_000; n++) {
              const candidate = `${id}-${n}`;
              if (!existingIds.has(candidate)) {
                id = candidate;
                break;
              }
            }
          }

          const item = Illustration.parse({
            type: 'illustration',
            id,
            name: payload.fileName.replace(/\.[^.]+$/, '').trim(),
            version: '1',
            tags: [],
            assets: [
              {
                format: payload.format,
                url: proxyUrl,
                background: 'either',
              },
            ],
            mood: [],
            pairsWith: [],
          });
          await store.putArtifact(payload.brandId, item);
        } catch (err) {
          console.error(
            '[blob-upload-token] item creation failed:',
            err instanceof Error ? err.message : err,
          );
        }
      },
    });

    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload token error' },
      { status: 400 },
    );
  }
}
