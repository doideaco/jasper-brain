/**
 * Next.js boot hook. Runs once per server instance on cold start.
 *
 * Auto-syncs filesystem seeds (under `brands/`) into Postgres in
 * add-only mode — i.e. inserts items that are in the seed but not
 * yet in the database, and never overwrites existing rows. This
 * means new templates / facets / items added in code land in the
 * deployed DB without anyone clicking the import button.
 *
 * Safety:
 *  - Add-only mode never overwrites a row that already exists, so
 *    hand-edited records (uploaded asset URLs, edited voice, etc.)
 *    are preserved.
 *  - In-process latch ensures the sync runs at most once per
 *    serverless function instance — subsequent requests on the
 *    same instance skip the work.
 *  - Errors are caught and logged; the server keeps booting.
 *  - Skipped entirely when DATABASE_URL isn't set (dev/filesystem
 *    backend) — the function inside also guards on this.
 */

let synced = false;

export async function register() {
  // Only run on the Node runtime — not Edge.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // In-process latch: each serverless instance syncs once.
  if (synced) return;
  synced = true;

  // Run in the background so the cold-start request isn't blocked.
  // The work is small (per-id existence check, only inserts new
  // rows) so it usually finishes before the first interactive
  // request, but we don't want to block boot if Postgres is slow.
  void runSync();
}

async function runSync() {
  try {
    const sha =
      process.env.VERCEL_GIT_COMMIT_SHA ??
      process.env.GIT_COMMIT_SHA ??
      'local';
    console.log(`[seed-sync] starting (commit ${sha.slice(0, 7)})`);

    // Dynamic import so the seed-sync module isn't loaded into edge
    // bundles or hot-reloaded dev contexts where it isn't needed.
    const { syncSeedFromFilesystem } = await import('./lib/seed-sync');
    const result = await syncSeedFromFilesystem('add-only');

    if (!result.ok) {
      console.warn(`[seed-sync] no-op: ${result.message}`);
      return;
    }

    const added = result.items ?? 0;
    const skipped = result.itemsSkipped ?? 0;
    const facets = result.customFacets ?? 0;
    const brands = result.brands ?? 0;
    const errs = result.errors?.length ?? 0;

    console.log(
      `[seed-sync] done: ${brands} brand profiles, ${facets} custom facets, ${added} items added, ${skipped} preserved${
        errs > 0 ? `, ${errs} errors` : ''
      }`,
    );
    if (errs > 0) {
      for (const e of result.errors ?? []) console.warn(`[seed-sync] ${e}`);
    }
  } catch (err) {
    console.error(
      '[seed-sync] failed:',
      err instanceof Error ? err.message : err,
    );
  }
}
