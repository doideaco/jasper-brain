import { z } from 'zod';

export const GROUPS = [
  {
    id: 'voice',
    label: 'Voice',
    blurb: "The brand's identity. Everything else is calibrated against this.",
  },
  {
    id: 'visual',
    label: 'Visual',
    blurb: 'Typography, color, logo — the brand seen, not heard.',
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    blurb: 'What the brand knows about itself, its market, and its products.',
  },
  {
    id: 'rules',
    label: 'Rules',
    blurb: 'The principles and limits that keep content on-brand.',
  },
  {
    id: 'plays',
    label: 'Plays',
    blurb:
      'How the brand actually does things — proven procedures and structures.',
  },
  {
    id: 'custom',
    label: 'Custom',
    blurb: 'Brand-specific facets — the long tail of what makes this brand particular.',
  },
] as const;

export type Group = (typeof GROUPS)[number];
export type GroupId = Group['id'];
export const GROUP_IDS = GROUPS.map((g) => g.id) as GroupId[];

export interface FacetDefinition {
  id: string;
  label: string;
  pluralLabel: string;
  blurb: string;
  /**
   * Behavioural instructions for AI tools — tells the AI when and how to
   * use items in this facet. Travels through every MCP response so an AI
   * knows what to do without having to be configured per-brand.
   */
  aiInstructions: string;
  group: GroupId;
  dir: string;
  builtIn: boolean;
  itemFormat: 'file' | 'folder';
}

export const BUILT_IN_FACETS: Record<string, FacetDefinition> = {
  voice: {
    id: 'voice',
    label: 'Voice',
    pluralLabel: 'Voices',
    blurb: 'Tone, vocabulary, and style profiles.',
    aiInstructions:
      "Before generating any text for this brand, load the primary voice via brain_get_item. Match every output to its tone descriptors, prefer/avoid vocabulary lists, and the patterns described in the body. If multiple voices exist, the brand's primaryVoiceId or the voice tagged 'primary' wins by default.",
    group: 'voice',
    dir: 'voices',
    builtIn: true,
    itemFormat: 'file',
  },
  value: {
    id: 'value',
    label: 'Value',
    pluralLabel: 'Values',
    blurb: 'Beliefs that shape every decision the brand makes.',
    aiInstructions:
      "Read every value when authoring identity-level content (about pages, mission statements, hiring copy, leadership posts). Use the example field to gauge how the value shows up in practice, not just abstractly.",
    group: 'voice',
    dir: 'values',
    builtIn: true,
    itemFormat: 'file',
  },
  typography: {
    id: 'typography',
    label: 'Typography',
    pluralLabel: 'Typography',
    blurb: 'Typefaces, font sources, and the type scale.',
    aiInstructions:
      "When generating HTML/CSS, include each typeface's source.cssImport string in the document's stylesheet (it might be an @import URL, an @font-face block, or a <link> tag — drop in verbatim). Reference families by family name plus the stack as fallback. Apply scale steps (display/h1/body/etc.) by their fontSize, lineHeight, fontWeight, and letterSpacing exactly.",
    group: 'visual',
    dir: 'typography',
    builtIn: true,
    itemFormat: 'file',
  },
  palette: {
    id: 'palette',
    label: 'Palette',
    pluralLabel: 'Palettes',
    blurb: 'Named color tokens with hex values and usage rules.',
    aiInstructions:
      "Use the named color tokens by their hex values when generating any HTML/CSS or design output. Respect role assignments — 'foreground' for text, 'background' for surfaces, 'primary' for actions. Honour the use field on each color (e.g., 'one brand color per screen') in your output.",
    group: 'visual',
    dir: 'palettes',
    builtIn: true,
    itemFormat: 'file',
  },
  logo: {
    id: 'logo',
    label: 'Logo',
    pluralLabel: 'Logos',
    blurb: 'Logo assets, variants, and clear-space rules.',
    aiInstructions:
      "When embedding the brand mark, pick the asset variant that matches the context — wordmark on light, dark on dark, icon when space is tight. Use the assets[].url verbatim in <img> or background-image. Respect the clearSpace and minSize rules.",
    group: 'visual',
    dir: 'logos',
    builtIn: true,
    itemFormat: 'file',
  },
  texture: {
    id: 'texture',
    label: 'Texture',
    pluralLabel: 'Textures',
    blurb:
      'CSS-driven surface treatments — patterns, gradients, blends, grain.',
    aiInstructions:
      "When applying a surface treatment to an element, use the css field verbatim in generated stylesheets. Match the texture's intended background (light/dark/either) to where you're using it. The use field tells you when each texture is appropriate.",
    group: 'visual',
    dir: 'textures',
    builtIn: true,
    itemFormat: 'file',
  },
  knowledge: {
    id: 'knowledge',
    label: 'Knowledge',
    pluralLabel: 'Knowledge',
    blurb: 'Facts about the brand, market, and audience.',
    aiInstructions:
      "Reference these items as factual context — about-the-company copy, founding details, what we do and for whom. Do not invent details that aren't here. If a knowledge item lists sources, cite them when relevant.",
    group: 'knowledge',
    dir: 'knowledge',
    builtIn: true,
    itemFormat: 'file',
  },
  product: {
    id: 'product',
    label: 'Product',
    pluralLabel: 'Products',
    blurb: 'Structured product data for content generation.',
    aiInstructions:
      "When writing about a specific product, fetch its item and use the audience, valueProps, features, and pricing verbatim. Lead with the value props, not the features. Don't fabricate product capabilities not listed here.",
    group: 'knowledge',
    dir: 'products',
    builtIn: true,
    itemFormat: 'file',
  },
  person: {
    id: 'person',
    label: 'Person',
    pluralLabel: 'People',
    blurb: 'Founders, leaders, and spokespeople — bios, quotes, and contacts.',
    aiInstructions:
      "When writing press, About pages, or attributed quotes, use the person's role and bio verbatim. The quote field is the canonical attributable line — use it as-is rather than paraphrasing. Use imageUrl when an avatar is needed.",
    group: 'knowledge',
    dir: 'people',
    builtIn: true,
    itemFormat: 'file',
  },
  guideline: {
    id: 'guideline',
    label: 'Guideline',
    pluralLabel: 'Guidelines',
    blurb: 'Principles for on-brand writing.',
    aiInstructions:
      "Apply guidelines to every piece of generated copy. Each has a scope (when it applies) and examples (do / don't). If a guideline's scope matches the content you're writing, the do examples are your model and the don't examples are forbidden.",
    group: 'rules',
    dir: 'guidelines',
    builtIn: true,
    itemFormat: 'file',
  },
  guardrail: {
    id: 'guardrail',
    label: 'Guardrail',
    pluralLabel: 'Guardrails',
    blurb: 'Hard limits — what to never say.',
    aiInstructions:
      "Hard constraints. severity='block' guardrails MUST be enforced — if generated content would violate one, rewrite until it doesn't. severity='warn' guardrails should be flagged in the output. The violations field is a list of forbidden phrasings; the compliant field is the approved alternatives.",
    group: 'rules',
    dir: 'guardrails',
    builtIn: true,
    itemFormat: 'file',
  },
  skill: {
    id: 'skill',
    label: 'Skill',
    pluralLabel: 'Skills',
    blurb: 'Reusable plays — procedures with embedded brand context.',
    aiInstructions:
      "Skills are step-by-step procedures the brand has perfected for specific tasks (e.g., 'write a launch announcement email'). When the user asks for one of these tasks, fetch the matching skill and follow its body's instructions exactly — they encode hard-won institutional knowledge.",
    group: 'plays',
    dir: 'skills',
    builtIn: true,
    itemFormat: 'folder',
  },
  template: {
    id: 'template',
    label: 'Template',
    pluralLabel: 'Templates',
    blurb: 'Tool-agnostic content structures.',
    aiInstructions:
      "Templates define the section structure for a piece of content (e.g., a landing page). When generating that format, use the sections array as the outline — render each section in order, fill its slots, follow per-section guidance and tone notes. Skip sections marked required:false only if the variant doesn't need them.",
    group: 'plays',
    dir: 'templates',
    builtIn: true,
    itemFormat: 'file',
  },
};

export const BUILT_IN_FACET_IDS = Object.keys(BUILT_IN_FACETS);

export const FACET_ID_PATTERN = /^[a-z][a-z0-9-]*$/;

export const CustomFacetDefinitionSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(FACET_ID_PATTERN, 'lowercase letters, digits, and hyphens only'),
  label: z.string().min(1),
  pluralLabel: z.string().min(1).optional(),
  blurb: z.string().default(''),
  /** Tells AI tools when and how to use items in this facet. */
  aiInstructions: z.string().default(''),
  group: z
    .enum(['voice', 'visual', 'knowledge', 'rules', 'plays', 'custom'])
    .default('custom'),
});

export type CustomFacetDefinition = z.infer<typeof CustomFacetDefinitionSchema>;

export function customFacetToDefinition(custom: CustomFacetDefinition): FacetDefinition {
  return {
    id: custom.id,
    label: custom.label,
    pluralLabel: custom.pluralLabel ?? custom.label,
    blurb: custom.blurb,
    aiInstructions: custom.aiInstructions ?? '',
    group: custom.group,
    dir: `custom/${custom.id}`,
    builtIn: false,
    itemFormat: 'file',
  };
}

export function isBuiltInFacet(facetId: string): boolean {
  return facetId in BUILT_IN_FACETS;
}
