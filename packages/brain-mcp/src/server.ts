import {
  Artifact,
  FilesystemStore,
  getBrandKit,
  type BrainStore,
} from '@jasper-brain/core';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export interface ServerOptions {
  /** Pre-built store. If provided, brainsRoot is ignored. */
  store?: BrainStore;
  /** Filesystem root — used only if `store` is not provided. */
  brainsRoot?: string;
  defaultBrandId?: string;
}

export function createBrainServer(options: ServerOptions): McpServer {
  const store: BrainStore =
    options.store ??
    new FilesystemStore(
      options.brainsRoot ??
        (() => {
          throw new Error('createBrainServer: pass `store` or `brainsRoot`');
        })(),
    );
  const fallbackBrand = options.defaultBrandId;

  const server = new McpServer(
    { name: 'jasper-brain', version: '0.0.1' },
    {
      instructions:
        "Jasper Brain — a brand's centralised knowledge and context layer. " +
        'A Brain has facets (voice, knowledge, products, guidelines, guardrails, skills, templates, ' +
        'plus any custom facets the brand has defined) and each facet contains items. ' +
        'Call brain_list_brands to discover brands, brain_list_facets to see what kinds of context ' +
        'this brand holds, brain_search or brain_list_items to find what to load, and brain_get_item ' +
        'for full content.',
    },
  );

  server.registerTool(
    'brain_list_brands',
    {
      description: 'List every brand available in this Brain.',
      inputSchema: {},
    },
    async () => {
      const brands = await store.listBrands();
      return { content: [{ type: 'text', text: JSON.stringify(brands, null, 2) }] };
    },
  );

  server.registerTool(
    'brain_get_brand',
    {
      description: 'Fetch a brand\'s metadata (name, description, primary voice).',
      inputSchema: {
        brandId: z.string().describe('Brand id, e.g. "jasper".'),
      },
    },
    async ({ brandId }) => {
      const brand = await store.getBrand(resolveBrand(brandId, fallbackBrand));
      return { content: [{ type: 'text', text: JSON.stringify(brand, null, 2) }] };
    },
  );

  server.registerTool(
    'brain_list_facets',
    {
      description:
        "List the brand's facets — the kinds of context a Brain holds " +
        '(voice, knowledge, products, guidelines, guardrails, skills, templates, plus any custom facets).',
      inputSchema: {
        brandId: z.string().optional(),
      },
    },
    async ({ brandId }) => {
      const facets = await store.listFacets(resolveBrand(brandId, fallbackBrand));
      return {
        content: [{ type: 'text', text: JSON.stringify(facets, null, 2) }],
      };
    },
  );

  server.registerTool(
    'brain_list_items',
    {
      description:
        "List items in one or all of a brand's facets. " +
        'Returns metadata only — call brain_get_item for the full content of any hit.',
      inputSchema: {
        brandId: z.string().optional(),
        facetId: z.string().optional(),
        tag: z.string().optional(),
      },
    },
    async ({ brandId, facetId, tag }) => {
      const items = await store.listArtifacts(resolveBrand(brandId, fallbackBrand), {
        facetId,
        tag,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(items.map(summarise), null, 2) }],
      };
    },
  );

  server.registerTool(
    'brain_get_item',
    {
      description: 'Fetch a single item in full, including body and structured fields.',
      inputSchema: {
        brandId: z.string().optional(),
        facetId: z.string(),
        id: z.string(),
      },
    },
    async ({ brandId, facetId, id }) => {
      const artifact = await store.getArtifact(
        resolveBrand(brandId, fallbackBrand),
        facetId,
        id,
      );
      return { content: [{ type: 'text', text: renderArtifact(artifact) }] };
    },
  );

  server.registerTool(
    'brain_get_brand_kit',
    {
      description:
        "Get everything an AI tool needs to author on-brand content for this brand in a single call: " +
        'brand profile (name, tagline, mission, vision, URLs, contact), primary voice, values, ' +
        'visual identity (primary typography with fonts and type scale, primary palette with hex tokens, ' +
        'primary logo with asset URLs), all guardrails, people, plus a discovery list of available skills, ' +
        'templates, knowledge, and products. Call this first when starting any authoring task.',
      inputSchema: {
        brandId: z.string().optional(),
      },
    },
    async ({ brandId }) => {
      const kit = await getBrandKit(store, resolveBrand(brandId, fallbackBrand));
      return { content: [{ type: 'text', text: JSON.stringify(kit, null, 2) }] };
    },
  );

  server.registerTool(
    'brain_search',
    {
      description:
        "Search a brand's items by keyword across all facets. Returns ranked metadata — " +
        'call brain_get_item for the full content of any hit.',
      inputSchema: {
        brandId: z.string().optional(),
        query: z.string().min(1),
        facetIds: z.array(z.string()).optional(),
        limit: z.number().int().positive().max(50).optional(),
      },
    },
    async ({ brandId, query, facetIds, limit }) => {
      const hits = await store.search(resolveBrand(brandId, fallbackBrand), query, {
        facetIds,
        limit,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(hits.map(summarise), null, 2) }],
      };
    },
  );

  return server;
}

function resolveBrand(brandId: string | undefined, fallback: string | undefined): string {
  const id = brandId ?? fallback;
  if (!id) {
    throw new Error(
      'No brand specified. Pass brandId, or start the server with --brand <id>.',
    );
  }
  return id;
}

function summarise(artifact: Artifact) {
  return {
    type: artifact.type,
    id: artifact.id,
    name: artifact.name,
    description: artifact.description,
    tags: artifact.tags,
  };
}

function renderArtifact(artifact: Artifact): string {
  return JSON.stringify(artifact, null, 2);
}
