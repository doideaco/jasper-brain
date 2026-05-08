/**
 * Node-runtime-only boot work. Imported by instrumentation.ts only
 * when NEXT_RUNTIME === 'nodejs', so the postgres / fs / net imports
 * never reach the Edge bundle.
 *
 * Runs two things on cold start:
 *  1. add-only seed sync (lib/seed-sync.ts) — adds new items from
 *     the filesystem seeds without overwriting existing rows.
 *  2. targeted data migrations (lib/data-migrations.ts) — patches
 *     known stale fields (rebrand colours, Tiempos refs) in
 *     existing rows. Idempotent and content-gated.
 *
 * In-process latch ensures both run at most once per serverless
 * function instance. All work is wrapped in try/catch so a failure
 * never blocks the server from booting.
 */
import { applyDataMigrations } from './lib/data-migrations';
import { syncSeedFromFilesystem } from './lib/seed-sync';
import { getStore, getStoreBackend } from './lib/store';

let started = false;

if (!started) {
  started = true;
  // Background — don't block the cold-start request.
  void run();
}

async function run() {
  await runSeedSync();
  await runDataMigrationsAllBrands();
}

async function runSeedSync() {
  try {
    const sha =
      process.env.VERCEL_GIT_COMMIT_SHA ??
      process.env.GIT_COMMIT_SHA ??
      'local';
    console.log(`[seed-sync] starting (commit ${sha.slice(0, 7)})`);

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

async function runDataMigrationsAllBrands() {
  try {
    // IMPORTANT: getStoreBackend() returns a cached value populated by
    // getStore(). On a cold start the cache is empty, so we MUST call
    // getStore() first or the backend check returns null and bails.
    const store = await getStore();
    if (getStoreBackend() !== 'postgres') return;
    const brands = await store.listBrands();

    for (const brand of brands) {
      const result = await applyDataMigrations(store, brand.id);
      if (result.applied.length > 0) {
        console.log(
          `[data-migrations] ${brand.id}: ${result.applied.length} applied`,
        );
        for (const m of result.applied) console.log(`[data-migrations]   ${m}`);
      }
      if (result.errors.length > 0) {
        for (const e of result.errors) {
          console.warn(`[data-migrations] ${brand.id}: ${e}`);
        }
      }
    }
  } catch (err) {
    console.error(
      '[data-migrations] failed:',
      err instanceof Error ? err.message : err,
    );
  }
}
