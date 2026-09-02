/**
 * Cron warm-up endpoint.
 *
 * Vercel Cron hits this every 5 minutes (see vercel.json). It:
 *   1. Boots the serverless function if it's cold, so real user
 *      MCP calls hit a warm container.
 *   2. Primes the in-process store cache with every brand's artifact
 *      list, so the first real request in the warm window is served
 *      from memory rather than from Postgres.
 *
 * Public: no Clerk gate. Vercel Cron dispatches unauthenticated. The
 * endpoint is read-only and returns only aggregate counts — no brand
 * data is exposed.
 */
import { NextResponse } from 'next/server';
import { getStore, getStoreBackend } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  try {
    const store = await getStore();
    const brands = await store.listBrands();
    let artifactCount = 0;
    // Prime each brand's cache in parallel — subsequent MCP calls
    // hitting getBrandKit / listArtifacts inside the cache TTL win
    // the memory path instead of Postgres.
    await Promise.all(
      brands.map(async (b) => {
        const items = await store.listArtifacts(b.id);
        artifactCount += items.length;
      }),
    );
    return NextResponse.json({
      ok: true,
      backend: getStoreBackend(),
      brands: brands.length,
      artifacts: artifactCount,
      elapsedMs: Date.now() - startedAt,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'warmup failed',
        elapsedMs: Date.now() - startedAt,
      },
      { status: 500 },
    );
  }
}
