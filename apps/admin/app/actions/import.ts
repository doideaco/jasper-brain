'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import {
  syncSeedFromFilesystem,
  type SeedSyncMode,
  type SeedSyncResult,
} from '@/lib/seed-sync';

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
