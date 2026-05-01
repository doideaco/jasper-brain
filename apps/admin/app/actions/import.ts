'use server';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import {
  FilesystemStore,
  type CustomFacetDefinition,
} from '@jasper-brain/core';
import { requireAdmin } from '@/lib/auth';
import { getStore, getStoreBackend } from '@/lib/store';

async function findBrandsDir(): Promise<string | null> {
  if (process.env.BRAIN_IMPORT_ROOT) {
    return path.resolve(process.env.BRAIN_IMPORT_ROOT);
  }
  const candidates = [
    path.resolve(process.cwd(), 'brands'),
    path.resolve(process.cwd(), '..', '..', 'brands'),
    path.resolve(process.cwd(), 'apps', 'admin', '..', '..', 'brands'),
  ];
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) return candidate;
    } catch {
      // try next
    }
  }
  return null;
}

export interface ImportResult {
  ok: boolean;
  message: string;
  brands?: number;
  items?: number;
  customFacets?: number;
  errors?: string[];
}

export async function importFromFilesystem(
  _prev: ImportResult | null,
  _formData: FormData,
): Promise<ImportResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unauthorized.',
    };
  }

  const target = await getStore();
  const backend = getStoreBackend();
  if (backend !== 'postgres') {
    return {
      ok: false,
      message:
        'Target backend is filesystem — nothing to import. Set DATABASE_URL to enable Postgres first.',
    };
  }

  const sourceRoot = await findBrandsDir();
  if (!sourceRoot) {
    return {
      ok: false,
      message:
        'Could not locate the brands/ source directory. Set BRAIN_IMPORT_ROOT to an absolute path containing brand directories.',
    };
  }

  const source = new FilesystemStore(sourceRoot);

  let brandCount = 0;
  let itemCount = 0;
  let customFacetCount = 0;
  const errors: string[] = [];

  try {
    const brands = await source.listBrands();
    if (brands.length === 0) {
      return {
        ok: false,
        message: `No brands found at ${sourceRoot}.`,
      };
    }

    for (const brand of brands) {
      try {
        await target.putBrand(brand);
        brandCount += 1;
      } catch (err) {
        errors.push(
          `brand ${brand.id}: ${err instanceof Error ? err.message : 'failed'}`,
        );
        continue;
      }

      const facets = await source.listFacets(brand.id);
      for (const facet of facets.filter((f) => !f.builtIn)) {
        const customDef: CustomFacetDefinition = {
          id: facet.id,
          label: facet.label,
          pluralLabel: facet.pluralLabel,
          blurb: facet.blurb,
          aiInstructions: facet.aiInstructions,
          group: facet.group,
        };
        try {
          await target.putCustomFacet(brand.id, customDef);
          customFacetCount += 1;
        } catch (err) {
          errors.push(
            `${brand.id}/facets/${facet.id}: ${err instanceof Error ? err.message : 'failed'}`,
          );
        }
      }

      const artifacts = await source.listArtifacts(brand.id);
      for (const artifact of artifacts) {
        try {
          await target.putArtifact(brand.id, artifact);
          itemCount += 1;
        } catch (err) {
          const fid =
            artifact.type === 'custom' ? artifact.facetId : artifact.type;
          errors.push(
            `${brand.id}/${fid}/${artifact.id}: ${err instanceof Error ? err.message : 'failed'}`,
          );
        }
      }
    }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Import failed.',
      errors,
    };
  }

  revalidatePath('/brands');

  return {
    ok: true,
    message: `Imported from ${sourceRoot}.`,
    brands: brandCount,
    items: itemCount,
    customFacets: customFacetCount,
    errors: errors.length > 0 ? errors : undefined,
  };
}
