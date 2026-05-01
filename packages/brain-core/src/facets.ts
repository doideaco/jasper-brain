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
    group: custom.group,
    dir: `custom/${custom.id}`,
    builtIn: false,
    itemFormat: 'file',
  };
}

export function isBuiltInFacet(facetId: string): boolean {
  return facetId in BUILT_IN_FACETS;
}
