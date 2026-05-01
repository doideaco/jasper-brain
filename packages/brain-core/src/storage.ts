import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import {
  BUILT_IN_FACETS,
  CustomFacetDefinitionSchema,
  customFacetToDefinition,
  isBuiltInFacet,
  type CustomFacetDefinition,
  type FacetDefinition,
} from './facets.js';
import { parseArtifact, serializeArtifact } from './parser.js';
import { rankArtifacts } from './search.js';
import {
  ARTIFACT_DIRS,
  Artifact,
  Brand,
  type ArtifactType,
} from './types.js';

export interface ListOptions {
  facetId?: string;
  tag?: string;
}

export interface SearchOptions {
  facetIds?: string[];
  limit?: number;
}

export interface BrainStore {
  listBrands(): Promise<Brand[]>;
  getBrand(id: string): Promise<Brand>;
  listFacets(brandId: string): Promise<FacetDefinition[]>;
  listArtifacts(brandId: string, options?: ListOptions): Promise<Artifact[]>;
  getArtifact(brandId: string, facetId: string, id: string): Promise<Artifact>;
  search(brandId: string, query: string, options?: SearchOptions): Promise<Artifact[]>;
}

export interface WritableBrainStore extends BrainStore {
  putBrand(brand: Brand): Promise<Brand>;
  deleteBrand(id: string): Promise<void>;
  putArtifact(brandId: string, artifact: Artifact): Promise<Artifact>;
  deleteArtifact(brandId: string, facetId: string, id: string): Promise<void>;
  putCustomFacet(brandId: string, facet: CustomFacetDefinition): Promise<void>;
  deleteCustomFacet(brandId: string, facetId: string): Promise<void>;
}

export class FilesystemStore implements WritableBrainStore {
  constructor(private readonly root: string) {}

  async listBrands(): Promise<Brand[]> {
    const entries = await safeReadDir(this.root);
    const brands: Brand[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const brand = await this.tryReadBrand(entry.name);
      if (brand) brands.push(brand);
    }
    return brands;
  }

  async getBrand(id: string): Promise<Brand> {
    const brand = await this.tryReadBrand(id);
    if (!brand) throw new Error(`Brand not found: ${id}`);
    return brand;
  }

  async listFacets(brandId: string): Promise<FacetDefinition[]> {
    const builtIn = Object.values(BUILT_IN_FACETS);
    const custom = await this.readCustomFacets(brandId);
    return [...builtIn, ...custom.map(customFacetToDefinition)];
  }

  async listArtifacts(brandId: string, options: ListOptions = {}): Promise<Artifact[]> {
    const facets = await this.listFacets(brandId);
    const targets = options.facetId
      ? facets.filter((f) => f.id === options.facetId)
      : facets;
    const all: Artifact[] = [];
    for (const facet of targets) {
      const dir = path.join(this.root, brandId, facet.dir);
      const entries = await safeReadDir(dir);
      for (const entry of entries) {
        const artifact = await this.tryReadArtifact(brandId, facet, entry.name);
        if (!artifact) continue;
        if (options.tag && !artifact.tags.includes(options.tag)) continue;
        all.push(artifact);
      }
    }
    return all;
  }

  async getArtifact(
    brandId: string,
    facetId: string,
    id: string,
  ): Promise<Artifact> {
    const facets = await this.listFacets(brandId);
    const facet = facets.find((f) => f.id === facetId);
    if (!facet) throw new Error(`Facet not found: ${facetId}`);
    const entryName = facet.itemFormat === 'folder' ? id : `${id}.md`;
    const artifact = await this.tryReadArtifact(brandId, facet, entryName);
    if (!artifact) throw new Error(`Artifact not found: ${facetId}/${id}`);
    return artifact;
  }

  async search(
    brandId: string,
    query: string,
    options: SearchOptions = {},
  ): Promise<Artifact[]> {
    const facetIds =
      options.facetIds ?? (await this.listFacets(brandId)).map((f) => f.id);
    const candidates = (
      await Promise.all(
        facetIds.map((facetId) => this.listArtifacts(brandId, { facetId })),
      )
    ).flat();
    return rankArtifacts(candidates, query, options.limit);
  }

  async putBrand(brand: Brand): Promise<Brand> {
    const dir = path.join(this.root, brand.id);
    await fs.mkdir(dir, { recursive: true });
    const { id: _id, ...rest } = brand;
    const cleaned = stripUndefined(rest);
    const yamlContent = stringifyYaml(cleaned);
    await fs.writeFile(path.join(dir, 'brand.yaml'), yamlContent, 'utf-8');
    return brand;
  }

  async deleteBrand(id: string): Promise<void> {
    const dir = path.join(this.root, id);
    await fs.rm(dir, { recursive: true, force: true });
  }

  async putArtifact(brandId: string, artifact: Artifact): Promise<Artifact> {
    const facets = await this.listFacets(brandId);
    const facetId =
      artifact.type === 'custom' ? artifact.facetId : artifact.type;
    const facet = facets.find((f) => f.id === facetId);
    if (!facet) throw new Error(`Facet not found: ${facetId}`);
    const brandDir = path.join(this.root, brandId);
    await fs.mkdir(brandDir, { recursive: true });
    const facetDir = path.join(brandDir, facet.dir);
    await fs.mkdir(facetDir, { recursive: true });
    let target: string;
    if (facet.itemFormat === 'folder') {
      const itemDir = path.join(facetDir, artifact.id);
      await fs.mkdir(itemDir, { recursive: true });
      target = path.join(itemDir, 'SKILL.md');
    } else {
      target = path.join(facetDir, `${artifact.id}.md`);
    }
    await fs.writeFile(target, serializeArtifact(artifact), 'utf-8');
    return artifact;
  }

  async deleteArtifact(
    brandId: string,
    facetId: string,
    id: string,
  ): Promise<void> {
    const facets = await this.listFacets(brandId);
    const facet = facets.find((f) => f.id === facetId);
    if (!facet) throw new Error(`Facet not found: ${facetId}`);
    const facetDir = path.join(this.root, brandId, facet.dir);
    if (facet.itemFormat === 'folder') {
      await fs.rm(path.join(facetDir, id), { recursive: true, force: true });
      return;
    }
    await fs.rm(path.join(facetDir, `${id}.md`), { force: true });
  }

  async putCustomFacet(
    brandId: string,
    facet: CustomFacetDefinition,
  ): Promise<void> {
    if (isBuiltInFacet(facet.id)) {
      throw new Error(
        `Facet id "${facet.id}" collides with a built-in facet. Pick a different id.`,
      );
    }
    CustomFacetDefinitionSchema.parse(facet);
    const existing = await this.readCustomFacets(brandId);
    const next = existing.filter((f) => f.id !== facet.id).concat(facet);
    await this.writeCustomFacets(brandId, next);
  }

  async deleteCustomFacet(brandId: string, facetId: string): Promise<void> {
    const existing = await this.readCustomFacets(brandId);
    const next = existing.filter((f) => f.id !== facetId);
    await this.writeCustomFacets(brandId, next);
    const dir = path.join(this.root, brandId, 'custom', facetId);
    await fs.rm(dir, { recursive: true, force: true });
  }

  private async readCustomFacets(
    brandId: string,
  ): Promise<CustomFacetDefinition[]> {
    const file = path.join(this.root, brandId, 'facets.yaml');
    const raw = await safeReadFile(file);
    if (!raw) return [];
    const parsed = parseYaml(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => CustomFacetDefinitionSchema.parse(entry));
  }

  private async writeCustomFacets(
    brandId: string,
    facets: CustomFacetDefinition[],
  ): Promise<void> {
    const file = path.join(this.root, brandId, 'facets.yaml');
    if (facets.length === 0) {
      await fs.rm(file, { force: true });
      return;
    }
    const yaml = stringifyYaml(facets);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, yaml, 'utf-8');
  }

  private async tryReadBrand(id: string): Promise<Brand | null> {
    const file = path.join(this.root, id, 'brand.yaml');
    const raw = await safeReadFile(file);
    if (!raw) return null;
    const parsed = parseYaml(raw) ?? {};
    return Brand.parse({ id, ...parsed });
  }

  private async tryReadArtifact(
    brandId: string,
    facet: FacetDefinition,
    entryName: string,
  ): Promise<Artifact | null> {
    const type: ArtifactType = facet.builtIn
      ? (facet.id as ArtifactType)
      : 'custom';
    const facetDir = path.join(this.root, brandId, facet.dir);

    if (facet.itemFormat === 'folder') {
      const itemDir = path.join(facetDir, entryName);
      const stat = await safeStat(itemDir);
      if (!stat?.isDirectory()) return null;
      const raw = await safeReadFile(path.join(itemDir, 'SKILL.md'));
      if (!raw) return null;
      const files = (await safeReadDir(itemDir))
        .filter((e) => e.isFile() && e.name !== 'SKILL.md')
        .map((e) => e.name);
      const artifact = parseArtifact(raw, type, entryName, facet.id);
      if (artifact.type !== 'skill') return artifact;
      return { ...artifact, files };
    }
    if (!entryName.endsWith('.md')) return null;
    const file = path.join(facetDir, entryName);
    const raw = await safeReadFile(file);
    if (!raw) return null;
    const id = entryName.replace(/\.md$/, '');
    return parseArtifact(raw, type, id, facet.id);
  }
}

async function safeReadDir(dir: string) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

async function safeReadFile(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

async function safeStat(file: string) {
  try {
    return await fs.stat(file);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  return out as T;
}
