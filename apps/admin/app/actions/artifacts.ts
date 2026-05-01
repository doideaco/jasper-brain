'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin, requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { parseArtifactForm } from '@/lib/parsers';
import { requireString } from '@/lib/form-helpers';

export interface ActionState {
  error: string | null;
}

export async function saveArtifact(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let brandId: string;
  let facetId: string;
  let id: string;

  try {
    await requireUser();
    brandId = requireString(formData, 'brandId');
    facetId = requireString(formData, 'facetId');
    const store = await getStore();
    const facets = await store.listFacets(brandId);
    const facet = facets.find((f) => f.id === facetId);
    if (!facet) return { error: `Unknown facet: ${facetId}` };
    const artifact = parseArtifactForm(facet, formData);
    id = artifact.id;
    await store.putArtifact(brandId, artifact);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to save.' };
  }

  revalidatePath(`/brands/${brandId}`);
  revalidatePath(`/brands/${brandId}/${facetId}/${id}`);
  redirect(`/brands/${brandId}/${facetId}/${id}`);
}

export async function deleteArtifact(formData: FormData): Promise<void> {
  await requireAdmin();
  const brandId = requireString(formData, 'brandId');
  const facetId = requireString(formData, 'facetId');
  const id = requireString(formData, 'id');

  await (await getStore()).deleteArtifact(brandId, facetId, id);
  revalidatePath(`/brands/${brandId}`);
  redirect(`/brands/${brandId}`);
}
