'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Brand } from '@jasper-brain/core';
import { requireAdmin, requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import {
  getString,
  getYaml,
  requireString,
  slugify,
  splitTags,
} from '@/lib/form-helpers';

export interface BrandActionState {
  error: string | null;
}

export async function createBrand(
  _prev: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  let brandId: string;

  try {
    await requireAdmin();
    const name = requireString(formData, 'name');
    const requestedId = getString(formData, 'id');
    brandId = (requestedId ?? slugify(name)).trim();
    if (!brandId) return { error: 'Brand id could not be derived from name.' };

    const store = await getStore();
    const existing = await store.listBrands();
    if (existing.some((b) => b.id === brandId)) {
      return { error: `A brand with id "${brandId}" already exists.` };
    }

    const brand = Brand.parse({
      id: brandId,
      name,
      description: getString(formData, 'description'),
      tagline: getString(formData, 'tagline'),
      tags: [],
      urls: {},
    });
    await store.putBrand(brand);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create.' };
  }

  revalidatePath('/brands');
  redirect(`/brands/${brandId}/edit`);
}

export async function saveBrand(
  _prev: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  let brandId: string;

  try {
    await requireUser();
    brandId = requireString(formData, 'id');
    const founded = getString(formData, 'founded');
    const brand = Brand.parse({
      id: brandId,
      name: requireString(formData, 'name'),
      tagline: getString(formData, 'tagline'),
      description: getString(formData, 'description'),
      primaryUrl: getString(formData, 'primaryUrl'),
      urls: getYaml(formData, 'urls') ?? {},
      mission: getString(formData, 'mission'),
      vision: getString(formData, 'vision'),
      founded: founded ? Number.parseInt(founded, 10) : undefined,
      hq: getYaml(formData, 'hq'),
      contact: getYaml(formData, 'contact'),
      primaryVoiceId: getString(formData, 'primaryVoiceId'),
      tags: splitTags(formData.get('tags')),
    });
    await (await getStore()).putBrand(brand);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to save.' };
  }

  revalidatePath(`/brands/${brandId}`);
  redirect(`/brands/${brandId}`);
}
