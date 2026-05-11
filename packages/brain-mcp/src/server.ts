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

const FRESHNESS_ADVISORY =
  'This is a fresh snapshot from the Signal. If a prior call in this conversation returned an earlier `as_of`, treat THIS one as authoritative — the brand changes between turns. Never cache.';

const SERVER_INSTRUCTIONS = `You are connected to the Jasper Signal — the SINGLE SOURCE OF TRUTH for this brand's voice, palette, typography, logos, guidelines, guardrails, products, people, and templates. The brand changes between sessions and even within a session. Your training data and any prior turn's results are STALE.

OPERATING CONTRACT — non-negotiable:

1. ALWAYS call brain_get_brand_kit BEFORE answering any question about the brand or producing any brand-aligned output. This includes copy, design, voice judgments, and product claims.

2. NEVER rely on a brain_get_brand_kit result from earlier turns. Re-fetch on every authoring task. The fetch is cheap; staleness is expensive.

3. NEVER answer from training-data knowledge of "Jasper" or any brand — even if you think you know it. The Signal overrides everything.

4. If a brain_* call hasn't happened in this turn and you're being asked about the brand, the FIRST tool call of your turn must be brain_get_brand_kit.

5. Treat every tool result's \`as_of\` timestamp as the freshness watermark. If you have multiple results in context, the highest \`as_of\` is current; prior ones are stale.

DISCOVERY FLOW (when you don't know the brand id yet): brain_list_brands → brain_list_facets → brain_search or brain_list_items → brain_get_item for full content.

PROMPTS: this server also exposes slash-commands (\`/write\`, \`/render-template\`, \`/audit\`, \`/brief\`) that auto-fetch fresh context. If the user invokes one, it pre-bundles the kit — you do not need to re-fetch on top of it.`;

/**
 * Wraps every tool response with an `as_of` timestamp and a freshness
 * advisory. Gives the model a concrete reason to prefer the most-recent
 * call in context over any cached / earlier-turn result.
 */
function freshenedPayload(data: unknown): string {
  return JSON.stringify(
    {
      as_of: new Date().toISOString(),
      advisory: FRESHNESS_ADVISORY,
      data,
    },
    null,
    2,
  );
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
    { instructions: SERVER_INSTRUCTIONS },
  );

  // ─────────────────────────────────────────────────────────────────────
  // TOOLS
  // ─────────────────────────────────────────────────────────────────────

  server.registerTool(
    'brain_list_brands',
    {
      description:
        'List every brand available in this Signal. Brands can be added or renamed — re-call rather than relying on prior turn results. Returns an as_of timestamp.',
      inputSchema: {},
    },
    async () => {
      const brands = await store.listBrands();
      return { content: [{ type: 'text', text: freshenedPayload(brands) }] };
    },
  );

  server.registerTool(
    'brain_get_brand',
    {
      description:
        "Fetch a brand's metadata (name, tagline, mission, vision, primary URLs, contact). " +
        'These fields are EDITED by humans — ALWAYS re-fetch before quoting any of them. ' +
        'Returns an as_of timestamp.',
      inputSchema: {
        brandId: z.string().describe('Brand id, e.g. "jasper".'),
      },
    },
    async ({ brandId }) => {
      const brand = await store.getBrand(resolveBrand(brandId, fallbackBrand));
      return { content: [{ type: 'text', text: freshenedPayload(brand) }] };
    },
  );

  server.registerTool(
    'brain_list_facets',
    {
      description:
        "List the brand's facets — the kinds of context a Signal holds " +
        '(voice, knowledge, products, guidelines, guardrails, skills, templates, plus any custom facets). ' +
        'New custom facets get added; labels and aiInstructions get edited. ' +
        'Re-call rather than relying on prior turns. Returns an as_of timestamp.',
      inputSchema: {
        brandId: z.string().optional(),
      },
    },
    async ({ brandId }) => {
      const facets = await store.listFacets(
        resolveBrand(brandId, fallbackBrand),
      );
      return { content: [{ type: 'text', text: freshenedPayload(facets) }] };
    },
  );

  server.registerTool(
    'brain_list_items',
    {
      description:
        "List items in one or all of a brand's facets. " +
        'Items are added, renamed, retagged, deleted between turns. ' +
        'Re-call rather than relying on a prior listing. ' +
        'Returns metadata only — call brain_get_item for the full content of any hit. ' +
        'Returns an as_of timestamp.',
      inputSchema: {
        brandId: z.string().optional(),
        facetId: z.string().optional(),
        tag: z.string().optional(),
      },
    },
    async ({ brandId, facetId, tag }) => {
      const items = await store.listArtifacts(
        resolveBrand(brandId, fallbackBrand),
        { facetId, tag },
      );
      return {
        content: [
          { type: 'text', text: freshenedPayload(items.map(summarise)) },
        ],
      };
    },
  );

  server.registerTool(
    'brain_get_item',
    {
      description:
        'Fetch a single item in full, including body and structured fields. ' +
        'Items are EDITED — body, sections, voice rules, palette colours, scale steps all change. ' +
        'ALWAYS re-fetch rather than relying on a prior turn. Returns an as_of timestamp.',
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
      return { content: [{ type: 'text', text: freshenedPayload(artifact) }] };
    },
  );

  server.registerTool(
    'brain_get_brand_kit',
    {
      description:
        '**CALL THIS FIRST on every authoring task.** Get everything an AI tool needs to author on-brand content for this brand in a single call: ' +
        'brand profile (name, tagline, mission, vision, URLs, contact), primary voice, values, ' +
        'visual identity (primary typography with fonts and type scale, primary palette with hex tokens, ' +
        'primary logo with asset URLs), all guardrails, people, plus a discovery list of available skills, ' +
        'templates, knowledge, and products. ' +
        'NEVER rely on a kit returned in an earlier turn — the brand changes between turns. ' +
        'Result includes an as_of timestamp; trust the most recent one in your context.',
      inputSchema: {
        brandId: z.string().optional(),
      },
    },
    async ({ brandId }) => {
      const kit = await getBrandKit(
        store,
        resolveBrand(brandId, fallbackBrand),
      );
      return { content: [{ type: 'text', text: freshenedPayload(kit) }] };
    },
  );

  server.registerTool(
    'brain_pick_illustration',
    {
      description:
        "Pick illustrations from the brand's library that match a desired mood/subject. " +
        'Returns up to N items with their asset URLs, mood tags, subject, use, and pairsWith. ' +
        'Use when a template needs an illustration slot filled — pass the surface tone as ' +
        'mood (e.g. "playful, energetic" for a launch email) and optionally a subject hint. ' +
        'Always re-call rather than relying on prior results — the library changes between turns.',
      inputSchema: {
        brandId: z.string().optional(),
        mood: z
          .array(z.string())
          .optional()
          .describe(
            'Mood tags to match (e.g. ["playful", "energetic"]). Items matching ANY mood score higher.',
          ),
        subject: z
          .string()
          .optional()
          .describe('Subject hint (e.g. "abstract-geometric", "eye"). Loose match.'),
        count: z
          .number()
          .int()
          .positive()
          .max(20)
          .default(5)
          .describe('Number of items to return (default 5, max 20).'),
      },
    },
    async ({ brandId, mood, subject, count }) => {
      const id = resolveBrand(brandId, fallbackBrand);
      const items = await store.listArtifacts(id, { facetId: 'illustration' });
      const illustrations = items.filter(
        (i): i is Extract<typeof i, { type: 'illustration' }> =>
          i.type === 'illustration' && i.assets.length > 0,
      );

      const moodLower = (mood ?? []).map((m) => m.toLowerCase());
      const subjLower = subject?.toLowerCase();

      const scored = illustrations.map((item) => {
        let score = 0;
        if (moodLower.length > 0) {
          const itemMoods = item.mood.map((m) => m.toLowerCase());
          for (const m of moodLower) if (itemMoods.includes(m)) score += 2;
        }
        if (subjLower && item.subject) {
          if (item.subject.toLowerCase() === subjLower) score += 3;
          else if (item.subject.toLowerCase().includes(subjLower)) score += 1;
        }
        // Tiny tiebreaker so untagged items still surface when no filters match.
        score += Math.random() * 0.01;
        return { item, score };
      });

      scored.sort((a, b) => b.score - a.score);
      const top = scored.slice(0, count ?? 5).map((s) => ({
        id: s.item.id,
        name: s.item.name,
        description: s.item.description,
        mood: s.item.mood,
        subject: s.item.subject,
        use: s.item.use,
        pairsWith: s.item.pairsWith,
        assets: s.item.assets,
      }));

      return {
        content: [{ type: 'text', text: freshenedPayload(top) }],
      };
    },
  );

  server.registerTool(
    'brain_search',
    {
      description:
        "Search a brand's items by keyword across all facets. " +
        'Items get added, edited, removed; re-call rather than relying on prior search results. ' +
        'Returns ranked metadata — call brain_get_item for the full content of any hit. ' +
        'Returns an as_of timestamp.',
      inputSchema: {
        brandId: z.string().optional(),
        query: z.string().min(1),
        facetIds: z.array(z.string()).optional(),
        limit: z.number().int().positive().max(50).optional(),
      },
    },
    async ({ brandId, query, facetIds, limit }) => {
      const hits = await store.search(
        resolveBrand(brandId, fallbackBrand),
        query,
        { facetIds, limit },
      );
      return {
        content: [
          { type: 'text', text: freshenedPayload(hits.map(summarise)) },
        ],
      };
    },
  );

  // ─────────────────────────────────────────────────────────────────────
  // PROMPTS — slash commands that GUARANTEE a fresh-context fetch by
  // pre-bundling the kit into the user message before the model reasons.
  // The fetch is not the model's decision; it's part of the prompt.
  // ─────────────────────────────────────────────────────────────────────

  server.registerPrompt(
    'write',
    {
      title: 'Write on-brand',
      description:
        'Write on-brand content using the latest brand kit. Auto-fetches a fresh kit before producing output, so the model cannot rely on stale memory. Use for any authoring task: copy, blog posts, social, ads, marketing pages.',
      argsSchema: {
        request: z
          .string()
          .describe(
            'What to write. e.g. "a launch email for our Q3 pricing change" or "three LinkedIn posts about the rebrand".',
          ),
        brandId: z
          .string()
          .optional()
          .describe('Brand id (defaults to the connected brand).'),
      },
    },
    async ({ request, brandId }) => {
      const id = resolveBrand(brandId, fallbackBrand);
      const kit = await getBrandKit(store, id);
      const ts = new Date().toISOString();
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `# Fresh ${id} brand kit (as_of: ${ts})\n\n\`\`\`json\n${JSON.stringify(kit, null, 2)}\n\`\`\`\n\n# Authoring rules — apply EVERY rule\n\n1. Match the brand's primary voice exactly — tone descriptors, prefer/avoid vocabulary, sentence rhythm.\n2. Apply EVERY guardrail. Block-severity guardrails are non-negotiable; rewrite until violations are zero.\n3. Use ONLY palette hex codes / typography stacks / logo URLs from the kit above. Never invent.\n4. Never fabricate facts about the brand that aren't in the kit.\n5. Cite items by their facet/id when relevant (e.g. "see voice/default", "applying guardrail/no-unverified-stats").\n\n# Request\n\n${request}`,
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    'render-template',
    {
      title: 'Render a template',
      description:
        'Render content from a Signal template (e.g. blog-post, email-blast). Auto-fetches the brand kit AND the named template item, then instructs the model to produce a previewable HTML5 document by filling the template scaffold. Use for templated marketing surfaces.',
      argsSchema: {
        templateId: z
          .string()
          .describe('Template id, e.g. "blog-post" or "email-blast".'),
        context: z
          .string()
          .describe(
            'What this rendering is about — the topic, audience, key facts. e.g. "announce the rebrand to our entire subscriber list. Anchor on confidence not surprise."',
          ),
        brandId: z
          .string()
          .optional()
          .describe('Brand id (defaults to the connected brand).'),
      },
    },
    async ({ templateId, context, brandId }) => {
      const id = resolveBrand(brandId, fallbackBrand);
      const [kit, template] = await Promise.all([
        getBrandKit(store, id),
        store.getArtifact(id, 'template', templateId),
      ]);
      const ts = new Date().toISOString();
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `# Fresh ${id} brand kit (as_of: ${ts})\n\n\`\`\`json\n${JSON.stringify(kit, null, 2)}\n\`\`\`\n\n# Template: ${templateId}\n\n\`\`\`json\n${JSON.stringify(template, null, 2)}\n\`\`\`\n\n# Strict output mode\n\nThis template's \`renderAs\` field declares the output format. Follow its "Output contract" (in the template body) to the letter. If the template carries a \`scaffold\`, use it as your starting document and FILL the {{slotName}} placeholders — do not redesign the structure.\n\nRespond with EXACTLY one fenced \`\`\`html block. No prose before, after, or between. Pre-return self-check:\n- First three chars of response are the fence.\n- First non-whitespace inside the fence is \`<!doctype html>\` (or for html-email, \`<!-- Subject: ... -->\` then \`<!-- Preview: ... -->\` then \`<!doctype html>\`).\n- Every \`#xxxxxx\` colour appears in the kit palette.\n- Every URL is from \`logo.assets[].url\` or a CTA URL the user supplied.\n- No \`{{slot}}\`, \`Lorem\`, \`TODO\`, or \`[bracketed-placeholder]\` survives.\n\n# Render the template for this context\n\n${context}`,
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    'audit',
    {
      title: 'Audit text against the Signal',
      description:
        "Audit a piece of text against the brand's voice and every guardrail. Auto-fetches the latest kit, then returns a report of violations, severity, and suggested rewrites. Use to check copy before publishing.",
      argsSchema: {
        text: z.string().describe('The text to audit, in full.'),
        brandId: z
          .string()
          .optional()
          .describe('Brand id (defaults to the connected brand).'),
      },
    },
    async ({ text, brandId }) => {
      const id = resolveBrand(brandId, fallbackBrand);
      const kit = await getBrandKit(store, id);
      const ts = new Date().toISOString();
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `# Fresh ${id} brand kit (as_of: ${ts})\n\n\`\`\`json\n${JSON.stringify(kit, null, 2)}\n\`\`\`\n\n# Audit instructions\n\nReview the text below against:\n1. Voice — tone descriptors, prefer/avoid vocabulary, sentence rhythm.\n2. Every guardrail in the kit. Note severity (block vs warn).\n3. Brand-fact claims — flag any that aren't sourced from \`knowledge\` or \`product\` items.\n\nReturn a structured report:\n- For each violation: the offending phrase (verbatim), the rule it breaks (facet/id), severity, and a one-line suggested rewrite.\n- A summary verdict: \`pass\` (zero block-severity hits) or \`block\` (one or more).\n- If \`pass\`, list any warn-severity issues that the author should still consider.\n\n# Text to audit\n\n${text}`,
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    'brief',
    {
      title: 'Brand brief',
      description:
        "Produce a structured briefing on the brand from the latest kit. Auto-fetches fresh data. Use at the start of a new project, or when handing off to another tool/agent. Returns: identity, voice, visual system, what to use / avoid, key people and products.",
      argsSchema: {
        brandId: z
          .string()
          .optional()
          .describe('Brand id (defaults to the connected brand).'),
      },
    },
    async ({ brandId }) => {
      const id = resolveBrand(brandId, fallbackBrand);
      const kit = await getBrandKit(store, id);
      const ts = new Date().toISOString();
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `# Fresh ${id} brand kit (as_of: ${ts})\n\n\`\`\`json\n${JSON.stringify(kit, null, 2)}\n\`\`\`\n\n# Briefing instructions\n\nProduce a one-page briefing on this brand for someone starting a new project. Sections:\n\n1. **Identity** — name, tagline, mission, vision in one paragraph each.\n2. **Voice** — tone in three adjectives, two prefer / two avoid examples, one signature sentence demonstrating the voice.\n3. **Visual system** — primary typeface families and the type scale at a glance, primary palette tokens with their hex and use, the canonical logo variants and where to use each.\n4. **Hard rules** — every block-severity guardrail, in one line each.\n5. **People** — who can be quoted publicly and their role.\n6. **Products** — name and one-line description per product.\n\nKeep it factual and short. Use only what's in the kit; never embellish.`,
            },
          },
        ],
      };
    },
  );

  return server;
}

function resolveBrand(
  brandId: string | undefined,
  fallback: string | undefined,
): string {
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
