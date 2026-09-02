/**
 * In-process caching wrapper around a WritableBrainStore.
 *
 * Motivation: every MCP tool call, admin page render, and share page
 * fetch does its own store.listArtifacts / store.getBrand — hitting
 * Postgres on every request. For a warm serverless container serving
 * a burst of related MCP calls (e.g. brain_get_brand_kit + brain_get_item
 * template + brain_pick_illustration in one blog-post generation),
 * that's 3+ round trips per burst. Memoising reads for a short TTL
 * cuts subsequent calls to ~1ms while still picking up admin writes
 * within a few seconds.
 *
 * Cache is per-process. Multiple serverless instances each have their
 * own cache; a write on instance A is invalidated in A immediately
 * and propagates to B, C, … as their entries expire (default 60s).
 * That's the right trade-off for brand data that changes rarely.
 */
import type {
  Artifact,
  Brand,
  CustomFacetDefinition,
  FacetDefinition,
  ListOptions,
  SearchOptions,
  WritableBrainStore,
} from '@jasper-brain/core';

type Cached<T> = { value: T; expires: number };

export interface CachedStoreOptions {
  /** Cache TTL in milliseconds. Default 60_000 (1 minute). */
  ttlMs?: number;
}

const DEFAULT_TTL_MS = 60_000;

export function cachedStore(
  inner: WritableBrainStore,
  options: CachedStoreOptions = {},
): WritableBrainStore {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;

  let brandsList: Cached<Brand[]> | null = null;
  const brandCache = new Map<string, Cached<Brand>>();
  const facetsCache = new Map<string, Cached<FacetDefinition[]>>();
  const listCache = new Map<string, Cached<Artifact[]>>();
  const artifactCache = new Map<string, Cached<Artifact>>();

  const now = () => Date.now();
  const fresh = <T>(c: Cached<T> | null | undefined): T | null =>
    c && c.expires > now() ? c.value : null;

  const listKey = (brandId: string, opts?: ListOptions) =>
    `${brandId}::${opts?.facetId ?? ''}::${opts?.tag ?? ''}`;
  const artifactKey = (brandId: string, facetId: string, id: string) =>
    `${brandId}::${facetId}::${id}`;

  /**
   * Blow away every cached entry that could reference `brandId`.
   * Called after any write that could change what the brand's reads
   * return: artifact writes, custom-facet writes, brand-row writes.
   */
  const invalidateBrand = (brandId: string) => {
    brandCache.delete(brandId);
    facetsCache.delete(brandId);
    const prefix = `${brandId}::`;
    for (const k of listCache.keys()) if (k.startsWith(prefix)) listCache.delete(k);
    for (const k of artifactCache.keys())
      if (k.startsWith(prefix)) artifactCache.delete(k);
  };

  return {
    async listBrands(): Promise<Brand[]> {
      const hit = fresh(brandsList);
      if (hit) return hit;
      const value = await inner.listBrands();
      brandsList = { value, expires: now() + ttlMs };
      return value;
    },

    async getBrand(id: string): Promise<Brand> {
      const hit = fresh(brandCache.get(id));
      if (hit) return hit;
      const value = await inner.getBrand(id);
      brandCache.set(id, { value, expires: now() + ttlMs });
      return value;
    },

    async listFacets(brandId: string): Promise<FacetDefinition[]> {
      const hit = fresh(facetsCache.get(brandId));
      if (hit) return hit;
      const value = await inner.listFacets(brandId);
      facetsCache.set(brandId, { value, expires: now() + ttlMs });
      return value;
    },

    async listArtifacts(
      brandId: string,
      opts?: ListOptions,
    ): Promise<Artifact[]> {
      const key = listKey(brandId, opts);
      const hit = fresh(listCache.get(key));
      if (hit) return hit;
      const value = await inner.listArtifacts(brandId, opts);
      listCache.set(key, { value, expires: now() + ttlMs });
      return value;
    },

    async getArtifact(
      brandId: string,
      facetId: string,
      id: string,
    ): Promise<Artifact> {
      const key = artifactKey(brandId, facetId, id);
      const hit = fresh(artifactCache.get(key));
      if (hit) return hit;
      const value = await inner.getArtifact(brandId, facetId, id);
      artifactCache.set(key, { value, expires: now() + ttlMs });
      return value;
    },

    async search(
      brandId: string,
      query: string,
      opts?: SearchOptions,
    ): Promise<Artifact[]> {
      // Highly variable query space — caching would waste memory
      // and hit-rate would be near zero. Pass through.
      return inner.search(brandId, query, opts);
    },

    async putBrand(brand: Brand): Promise<Brand> {
      const value = await inner.putBrand(brand);
      brandCache.delete(brand.id);
      brandsList = null;
      return value;
    },

    async deleteBrand(id: string): Promise<void> {
      await inner.deleteBrand(id);
      invalidateBrand(id);
      brandsList = null;
    },

    async putArtifact(
      brandId: string,
      artifact: Artifact,
    ): Promise<Artifact> {
      const value = await inner.putArtifact(brandId, artifact);
      invalidateBrand(brandId);
      return value;
    },

    async deleteArtifact(
      brandId: string,
      facetId: string,
      id: string,
    ): Promise<void> {
      await inner.deleteArtifact(brandId, facetId, id);
      invalidateBrand(brandId);
    },

    async putCustomFacet(
      brandId: string,
      facet: CustomFacetDefinition,
    ): Promise<void> {
      await inner.putCustomFacet(brandId, facet);
      invalidateBrand(brandId);
    },

    async deleteCustomFacet(brandId: string, facetId: string): Promise<void> {
      await inner.deleteCustomFacet(brandId, facetId);
      invalidateBrand(brandId);
    },
  };
}
