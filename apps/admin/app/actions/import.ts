'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { applyDataMigrations } from '@/lib/data-migrations';
import {
  syncSeedFromFilesystem,
  type SeedSyncMode,
  type SeedSyncResult,
} from '@/lib/seed-sync';
import { getStore, getStoreBackend } from '@/lib/store';

export type ImportResult = SeedSyncResult;

export async function importFromFilesystem(
  _prev: ImportResult | null,
  formData: FormData,
): Promise<ImportResult> {
  const mode: SeedSyncMode =
    formData.get('mode') === 'add-only' ? 'add-only' : 'overwrite';

  try {
    await requireAdmin();
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unauthorized.',
    };
  }

  const result = await syncSeedFromFilesystem(mode);
  revalidatePath('/brands');
  return result;
}

export interface MigrationActionResult {
  ok: boolean;
  message: string;
  totalApplied?: number;
  perBrand?: Record<string, { applied: string[]; errors: string[] }>;
}

export async function runDataMigrations(
  _prev: MigrationActionResult | null,
  _formData: FormData,
): Promise<MigrationActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unauthorized.',
    };
  }

  // IMPORTANT: getStoreBackend() returns a cached value that's only
  // populated after getStore() has run on this function instance. Call
  // getStore() FIRST, then check the backend.
  const store = await getStore();
  if (getStoreBackend() !== 'postgres') {
    return {
      ok: false,
      message: 'Postgres backend not configured.',
    };
  }

  const brands = await store.listBrands();
  const perBrand: Record<string, { applied: string[]; errors: string[] }> = {};
  let totalApplied = 0;
  for (const brand of brands) {
    const r = await applyDataMigrations(store, brand.id);
    perBrand[brand.id] = r;
    totalApplied += r.applied.length;
  }

  revalidatePath('/brands');

  return {
    ok: true,
    message:
      totalApplied > 0
        ? `Applied ${totalApplied} migration${totalApplied === 1 ? '' : 's'} across ${brands.length} brand${brands.length === 1 ? '' : 's'}.`
        : `No stale fields found across ${brands.length} brand${brands.length === 1 ? '' : 's'} — already up to date.`,
    totalApplied,
    perBrand,
  };
}
