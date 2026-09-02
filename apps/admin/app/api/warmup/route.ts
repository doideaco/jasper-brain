/**
 * Warm-up endpoint. Boots the serverless function if cold and primes
 * the in-process store cache with every brand's artifact list, so
 * subsequent MCP calls hitting the same warm container are served
 * from memory rather than from Postgres.
 *
 * Public: no Clerk gate. Read-only, returns only aggregate counts —
 * no brand data is exposed.
 *
 * Ideally hit by a scheduled ping (Vercel Cron on Pro / an external
 * scheduler on Hobby) every few minutes to keep at least one
 * instance per region warm. On the Hobby plan Vercel Cron is capped
 * at once per day, which is too infrequent to be useful as a
 * warm-up — see the README for external-scheduler options
 * (cron-job.org, GitHub Actions on a schedule).
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
