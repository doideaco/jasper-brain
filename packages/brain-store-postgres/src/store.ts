import {
  Artifact,
  BUILT_IN_FACETS,
  Brand,
  CustomFacetDefinitionSchema,
  customFacetToDefinition,
  isBuiltInFacet,
  rankArtifacts,
  type CustomFacetDefinition,
  type FacetDefinition,
  type ListOptions,
  type SearchOptions,
  type WritableBrainStore,
} from '@jasper-brain/core';
import { and, eq } from 'drizzle-orm';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';
import { migrate } from './migrate.js';
import { artifacts, brands, customFacets } from './schema.js';

export interface PostgresStoreOptions {
  /** Set false to skip auto-migrate on first use. */
  autoMigrate?: boolean;
  /** Pool size — postgres-js default is 10. */
  max?: number;
}

export class PostgresStore implements WritableBrainStore {
  private readonly client: Sql;
  private readonly db: PostgresJsDatabase;
  private readonly autoMigrate: boolean;
  private migrationPromise: Promise<void> | null = null;

  constructor(connectionString: string, options: PostgresStoreOptions = {}) {
    this.client = postgres(connectionString, {
      max: options.max ?? 5,
      prepare: false,
    });
    this.db = drizzle(this.client);
    this.autoMigrate = options.autoMigrate ?? true;
  }

  /** Idempotent — runs once per process. */
  async migrate(): Promise<void> {
    if (this.migrationPromise) return this.migrationPromise;
    this.migrationPromise = migrate(this.client);
    return this.migrationPromise;
  }

  async close(): Promise<void> {
    await this.client.end();
  }

  private async ready(): Promise<void> {
    if (this.autoMigrate) await this.migrate();
  }

  async listBrands(): Promise<Brand[]> {
    await this.ready();
    const rows = await this.db.select().from(brands).orderBy(brands.id);
    return rows.map((r) => Brand.parse(r.data));
  }

  async getBrand(id: string): Promise<Brand> {
    await this.ready();
    const rows = await this.db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1);
    if (rows.length === 0) throw new Error(`Brand not found: ${id}`);
    return Brand.parse(rows[0].data);
  }

  async listFacets(brandId: string): Promise<FacetDefinition[]> {
    await this.ready();
    const builtIn = Object.values(BUILT_IN_FACETS);
    const rows = await this.db
      .select()
      .from(customFacets)
      .where(eq(customFacets.brandId, brandId));
    const custom = rows.map((r) =>
      customFacetToDefinition(CustomFacetDefinitionSchema.parse(r.data)),
    );
    return [...builtIn, ...custom];
  }

  async listArtifacts(
    brandId: string,
    options: ListOptions = {},
  ): Promise<Artifact[]> {
    await this.ready();
    const conditions = [eq(artifacts.brandId, brandId)];
    if (options.facetId) conditions.push(eq(artifacts.facetId, options.facetId));
    const rows = await this.db
      .select()
      .from(artifacts)
      .where(and(...conditions));
    let result = rows.map((r) => Artifact.parse(r.data));
    if (options.tag) {
      result = result.filter((a) => a.tags.includes(options.tag!));
    }
    return result;
  }

  async getArtifact(
    brandId: string,
    facetId: string,
    id: string,
  ): Promise<Artifact> {
    await this.ready();
    const rows = await this.db
      .select()
      .from(artifacts)
      .where(
        and(
          eq(artifacts.brandId, brandId),
          eq(artifacts.facetId, facetId),
          eq(artifacts.itemId, id),
        ),
      )
      .limit(1);
    if (rows.length === 0) {
      throw new Error(`Artifact not found: ${facetId}/${id}`);
    }
    return Artifact.parse(rows[0].data);
  }

  async search(
    brandId: string,
    query: string,
    options: SearchOptions = {},
  ): Promise<Artifact[]> {
    const all = await this.listArtifacts(brandId);
    const filtered = options.facetIds
      ? all.filter((a) => {
          const fid = a.type === 'custom' ? a.facetId : a.type;
          return options.facetIds!.includes(fid);
        })
      : all;
    return rankArtifacts(filtered, query, options.limit);
  }

  async putBrand(brand: Brand): Promise<Brand> {
    await this.ready();
    await this.db
      .insert(brands)
      .values({ id: brand.id, data: brand })
      .onConflictDoUpdate({
        target: brands.id,
        set: { data: brand, updatedAt: new Date() },
      });
    return brand;
  }

  async deleteBrand(id: string): Promise<void> {
    await this.ready();
    await this.db.delete(brands).where(eq(brands.id, id));
  }

  async putArtifact(brandId: string, artifact: Artifact): Promise<Artifact> {
    await this.ready();
    const facetId = artifact.type === 'custom' ? artifact.facetId : artifact.type;
    await this.db
      .insert(artifacts)
      .values({
        brandId,
        facetId,
        itemId: artifact.id,
        data: artifact,
      })
      .onConflictDoUpdate({
        target: [artifacts.brandId, artifacts.facetId, artifacts.itemId],
        set: { data: artifact, updatedAt: new Date() },
      });
    return artifact;
  }

  async deleteArtifact(
    brandId: string,
    facetId: string,
    id: string,
  ): Promise<void> {
    await this.ready();
    await this.db
      .delete(artifacts)
      .where(
        and(
          eq(artifacts.brandId, brandId),
          eq(artifacts.facetId, facetId),
          eq(artifacts.itemId, id),
        ),
      );
  }

  async putCustomFacet(
    brandId: string,
    facet: CustomFacetDefinition,
  ): Promise<void> {
    await this.ready();
    if (isBuiltInFacet(facet.id)) {
      throw new Error(
        `Facet id "${facet.id}" collides with a built-in facet. Pick a different id.`,
      );
    }
    CustomFacetDefinitionSchema.parse(facet);
    await this.db
      .insert(customFacets)
      .values({
        brandId,
        facetId: facet.id,
        data: facet,
      })
      .onConflictDoUpdate({
        target: [customFacets.brandId, customFacets.facetId],
        set: { data: facet },
      });
  }

  async deleteCustomFacet(brandId: string, facetId: string): Promise<void> {
    await this.ready();
    await this.db
      .delete(customFacets)
      .where(
        and(
          eq(customFacets.brandId, brandId),
          eq(customFacets.facetId, facetId),
        ),
      );
    await this.db
      .delete(artifacts)
      .where(
        and(
          eq(artifacts.brandId, brandId),
          eq(artifacts.facetId, facetId),
        ),
      );
  }
}
