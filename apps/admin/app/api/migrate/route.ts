/**
 * Manual migration trigger. Hits the same code path the boot hook
 * runs (lib/data-migrations.ts), but admin-gated so it can be
 * invoked on demand without relying on a cold-start to fire it.
 *
 * Usage:
 *   POST /api/migrate          — run for every brand
 *   POST /api/migrate?brand=X  — run for a single brand
 *
 * Auth: requires the caller to be a signed-in admin (Clerk role:
 * 'admin'). Returns 401 otherwise.
 */
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { applyDataMigrations } from '@/lib/data-migrations';
import { getStore, getStoreBackend } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Unauthorized' },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const brandFilter = url.searchParams.get('brand');

  // IMPORTANT: getStoreBackend() returns a cached value populated by
  // getStore(). On a cold start the cache is empty, so we MUST call
  // getStore() first or the backend check returns null and bails —
  // same trap as the boot hook in instrumentation-node.ts.
  const store = await getStore();
  if (getStoreBackend() !== 'postgres') {
    return NextResponse.json(
      { ok: false, error: 'Postgres backend not configured.' },
      { status: 400 },
    );
  }
  const allBrands = await store.listBrands();
  const brands = brandFilter
    ? allBrands.filter((b) => b.id === brandFilter)
    : allBrands;

  if (brands.length === 0) {
    return NextResponse.json(
      { ok: false, error: brandFilter ? `Brand '${brandFilter}' not found.` : 'No brands.' },
      { status: 404 },
    );
  }

  const results: Record<string, { applied: string[]; errors: string[] }> = {};
  for (const brand of brands) {
    const r = await applyDataMigrations(store, brand.id);
    results[brand.id] = r;
  }

  return NextResponse.json({ ok: true, brands: brands.length, results });
}

export async function GET() {
  return NextResponse.json({
    note: 'POST to run targeted data migrations. Optional query: ?brand=<id>. Admin auth required.',
  });
}
