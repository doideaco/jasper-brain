'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  CustomFacetDefinitionSchema,
  GROUP_IDS,
  isBuiltInFacet,
} from '@jasper-brain/core';
import { requireAdmin, requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { getString, requireString } from '@/lib/form-helpers';

export interface FacetActionState {
  error: string | null;
}

export async function createCustomFacet(
  _prev: FacetActionState,
  formData: FormData,
): Promise<FacetActionState> {
  let brandId: string;
  let facetId: string;

  try {
    await requireUser();
    brandId = requireString(formData, 'brandId');
    const groupRaw = getString(formData, 'group') ?? 'custom';
    if (!(GROUP_IDS as string[]).includes(groupRaw)) {
      return { error: `Invalid group: ${groupRaw}` };
    }
    const facet = CustomFacetDefinitionSchema.parse({
      id: requireString(formData, 'id'),
      label: requireString(formData, 'label'),
      pluralLabel: getString(formData, 'pluralLabel'),
      blurb: getString(formData, 'blurb') ?? '',
      group: groupRaw,
    });
    if (isBuiltInFacet(facet.id)) {
      return {
        error: `"${facet.id}" is a built-in facet. Pick a different id.`,
      };
    }
    facetId = facet.id;
    await (await getStore()).putCustomFacet(brandId, facet);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to save.' };
  }

  revalidatePath(`/brands/${brandId}`);
  // Land on the new facet's empty list — the natural next move is "+ New item".
  redirect(`/brands/${brandId}/${facetId}`);
}

export async function deleteCustomFacet(formData: FormData): Promise<void> {
  await requireAdmin();
  const brandId = requireString(formData, 'brandId');
  const facetId = requireString(formData, 'facetId');
  await (await getStore()).deleteCustomFacet(brandId, facetId);
  revalidatePath(`/brands/${brandId}`);
  redirect(`/brands/${brandId}`);
}
