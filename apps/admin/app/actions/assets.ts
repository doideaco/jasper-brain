'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, requireUser } from '@/lib/auth';
import { deleteUpload, uploadFile, type UploadedAsset } from '@/lib/blob';
import { requireString } from '@/lib/form-helpers';

export interface UploadResult {
  asset?: UploadedAsset;
  error?: string;
}

export async function uploadAsset(
  _prev: UploadResult,
  formData: FormData,
): Promise<UploadResult> {
  try {
    await requireUser();
    const brandId = requireString(formData, 'brandId');
    const file = formData.get('file');
    if (!(file instanceof File)) return { error: 'No file provided.' };
    if (file.size === 0) return { error: 'File is empty.' };
    if (file.size > 25 * 1024 * 1024) {
      return { error: 'File is larger than 25 MB.' };
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const asset = await uploadFile(
      brandId,
      file.name,
      bytes,
      file.type || 'application/octet-stream',
    );
    revalidatePath(`/brands/${brandId}/assets`);
    return { asset };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Upload failed.' };
  }
}

export async function deleteAsset(formData: FormData): Promise<void> {
  await requireAdmin();
  const brandId = requireString(formData, 'brandId');
  const pathname = requireString(formData, 'pathname');
  await deleteUpload(brandId, pathname);
  revalidatePath(`/brands/${brandId}/assets`);
}
