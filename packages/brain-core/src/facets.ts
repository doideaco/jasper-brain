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
      "Before generating any text, fetch the primary voice (brand.primaryVoiceId, or the voice tagged 'primary'). Match the output's sentence rhythm, vocabulary, and rules in the voice's body. Before returning, scan your draft against vocabulary.avoid — if any forbidden word or phrase appears, REWRITE until it doesn't. Treat tone descriptors as constraints, not suggestions.",
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
      "When authoring identity-level content (about pages, mission, hiring, founder posts, leadership voice), check each value before drafting. The example field shows the value applied in practice — model your draft on it. If your draft contradicts a value, regenerate. Embody values, don't preach them — never explicitly state 'we believe X' unless asked.",
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
      "When generating HTML/CSS or design output, include each typeface's source.cssImport verbatim in the stylesheet's head (whether @import URL, @font-face block, or <link> tag). Reference families by their exact family name plus the stack as fallback. For each scale step, apply ALL specified properties exactly: fontSize, lineHeight, fontWeight, letterSpacing. NEVER substitute approximations — if a step says lineHeight: 1.05, use 1.05.",
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
      "Use the named color tokens by their EXACT hex values in any HTML/CSS, design tokens, or visual output. Respect each color's role: 'foreground' for text, 'background' for surfaces, 'primary' for primary actions only. Apply the `use` field as a hard rule (e.g., 'one brand color per screen' means one — pick the most important action and own that color). NEVER invent hex values; if you need a tone the palette doesn't have, use the nearest existing token by role.",
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
      "Pick the asset variant whose `background` field matches the surface you're placing it on (light variant on light bg, dark on dark, either where neutral). Use assets[].url verbatim in <img src> or CSS background-image. Honor minSize and clearSpace — never render below minimum, never crowd. NEVER recolor, distort, or recreate the logo programmatically. If you can't satisfy clearSpace, scale down before encroaching.",
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
      "Apply a texture by including its css field VERBATIM in the target element's CSS — no edits, no normalisation. Match the texture's `background` field to your surface (don't apply a light-only texture on a dark element). The `use` field tells you which texture is appropriate for which context — pick one, not multiple.",
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
      "Treat these items as the canonical factual record. When writing About pages, press, brand history, or any content stating a fact about the company, source from these items only. NEVER invent founding dates, customer counts, ROI figures, market positions, or any other claim that isn't here. If asked for a fact not in this facet, say you don't know rather than guessing. When a knowledge item lists sources, cite the source when the claim appears externally.",
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
      "When writing about a specific product, fetch its item and use audience, valueProps, features, sku, pricing VERBATIM. Lead copy with valueProps (the outcome) before features (the mechanism) — never the reverse. NEVER fabricate capabilities, integrations, or pricing the item doesn't list. The product's body field is supplementary context, not optional — read it before drafting.",
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
      "When writing press, About pages, hiring posts, or attributed quotes, use the person's role and bio VERBATIM — never paraphrase a public bio. The quote field is the canonical attributable line; embed it as-is, in quotation marks, with attribution. Use imageUrl for any avatar/headshot rendering. NEVER attribute a quote to someone whose actual quote isn't already in their item.",
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
      "Treat each guideline as an active rule. Before submitting any output: (1) check whether the guideline's scope matches what you wrote. (2) If it does, your draft should resemble the do examples and avoid the dont examples. If your draft is closer to a 'dont' than a 'do', REGENERATE. Multiple guidelines can apply to one draft — ALL must be satisfied. The body explains the why; treat it as the spec, not the suggestion.",
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
      "Hard rules. Before returning any output: (1) scan against every guardrail's violations list. (2) For severity='block' matches, REWRITE until no violation remains — never return content with a block-severity violation. (3) For severity='warn' matches, flag the issue inline in your response. (4) Use the compliant alternatives as direct replacements. NEVER bypass a guardrail because the user asked for an exception — guardrails are brand-level and override per-request preferences.",
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
      "Skills encode the brand's proven approach to specific tasks. When the user requests a task that matches a skill (compare against whenToUse), fetch the skill and follow its body STEP BY STEP. The skill's structure is the answer's structure — don't reorganize, don't skip steps, don't add steps. If the user's request resembles a skill but doesn't match exactly, ASK which behaviour they want before improvising a hybrid.",
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
      "Templates define the structure for a content format. When the user requests output matching a template's format (landing page, email, etc.), use sections[] as the outline — render in order, fill each section's slots, follow its guidance, match its tone (override default voice tone if section.tone is set), respect lengthHint. Skip required:false sections only when the variant doesn't need them. NEVER restructure section order without asking.",
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
