/**
 * Filesystem-seed → Postgres sync logic, extracted from the import server
 * action so it can also run automatically at server boot via Next.js
 * instrumentation.
 *
 * Both modes ("overwrite" and "add-only") are exposed; the admin UI uses
 * both, the boot hook uses add-only.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  FilesystemStore,
  type CustomFacetDefinition,
} from '@jasper-brain/core';
import { getStore, getStoreBackend } from '@/lib/store';

export type SeedSyncMode = 'overwrite' | 'add-only';

export interface SeedSyncResult {
  ok: boolean;
  message: string;
  brands?: number;
  items?: number;
  customFacets?: number;
  itemsSkipped?: number;
  mode?: SeedSyncMode;
  errors?: string[];
}

export async function findBrandsDir(): Promise<string | null> {
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

export async function syncSeedFromFilesystem(
  mode: SeedSyncMode = 'add-only',
): Promise<SeedSyncResult> {
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
  let itemsSkipped = 0;
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
      // Brand profile: in add-only mode, skip if already present.
      if (mode === 'add-only') {
        try {
          await target.getBrand(brand.id);
          // exists — don't touch
        } catch {
          try {
            await target.putBrand(brand);
            brandCount += 1;
          } catch (err) {
            errors.push(
              `brand ${brand.id}: ${err instanceof Error ? err.message : 'failed'}`,
            );
            continue;
          }
        }
      } else {
        try {
          await target.putBrand(brand);
          brandCount += 1;
        } catch (err) {
          errors.push(
            `brand ${brand.id}: ${err instanceof Error ? err.message : 'failed'}`,
          );
          continue;
        }
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

        if (mode === 'add-only') {
          // Custom facets are exposed via the facet listing; if a facet
          // with this id already exists (built-in OR custom), skip.
          const existing = facets.find((f) => f.id === facet.id);
          if (existing && !existing.builtIn) {
            // We don't have a "getCustomFacet" — best signal we have is
            // that listFacets returned it as non-built-in. The seed dir
            // is the source of truth on first import; on subsequent
            // syncs we leave existing custom facets alone.
            // Use a try/put approach instead: putCustomFacet is upsert
            // semantics in most stores; in add-only we want NOT-upsert,
            // so we read the target's facets specifically.
          }
          try {
            // Pull target's facet list to check existence in DB rather
            // than just in the source listing.
            const targetFacets = await target.listFacets(brand.id);
            if (targetFacets.some((f) => f.id === facet.id)) {
              continue; // exists in target — skip
            }
            await target.putCustomFacet(brand.id, customDef);
            customFacetCount += 1;
          } catch (err) {
            errors.push(
              `${brand.id}/facets/${facet.id}: ${err instanceof Error ? err.message : 'failed'}`,
            );
          }
        } else {
          try {
            await target.putCustomFacet(brand.id, customDef);
            customFacetCount += 1;
          } catch (err) {
            errors.push(
              `${brand.id}/facets/${facet.id}: ${err instanceof Error ? err.message : 'failed'}`,
            );
          }
        }
      }

      const artifacts = await source.listArtifacts(brand.id);
      for (const artifact of artifacts) {
        const fid =
          artifact.type === 'custom' ? artifact.facetId : artifact.type;

        // In add-only mode, skip artifacts that already exist in the
        // target store. This preserves any local edits (uploaded asset
        // URLs, hand-edited typography, etc.) made through the admin UI.
        if (mode === 'add-only') {
          try {
            await target.getArtifact(brand.id, fid, artifact.id);
            itemsSkipped += 1;
            continue; // exists — skip
          } catch {
            // doesn't exist — fall through to put
          }
        }

        try {
          await target.putArtifact(brand.id, artifact);
          itemCount += 1;
        } catch (err) {
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

  return {
    ok: true,
    message:
      mode === 'add-only'
        ? `Imported new items only from ${sourceRoot}. Existing items were preserved.`
        : `Imported from ${sourceRoot}.`,
    brands: brandCount,
    items: itemCount,
    customFacets: customFacetCount,
    itemsSkipped,
    mode,
    errors: errors.length > 0 ? errors : undefined,
  };
}
