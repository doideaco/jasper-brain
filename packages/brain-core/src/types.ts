import { z } from 'zod';

export const ARTIFACT_TYPES = [
  'guideline',
  'voice',
  'value',
  'skill',
  'template',
  'knowledge',
  'guardrail',
  'product',
  'person',
  'typography',
  'palette',
  'logo',
  'custom',
] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

const baseArtifactFields = {
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string().default('1'),
  tags: z.array(z.string()).default([]),
  updatedAt: z.string().optional(),
};

export const Guideline = z.object({
  type: z.literal('guideline'),
  ...baseArtifactFields,
  scope: z.string().optional(),
  body: z.string(),
  examples: z
    .object({
      do: z.array(z.string()).default([]),
      dont: z.array(z.string()).default([]),
    })
    .optional(),
});
export type Guideline = z.infer<typeof Guideline>;

export const Voice = z.object({
  type: z.literal('voice'),
  ...baseArtifactFields,
  tone: z.array(z.string()).default([]),
  vocabulary: z
    .object({
      prefer: z.array(z.string()).default([]),
      avoid: z.array(z.string()).default([]),
    })
    .optional(),
  body: z.string(),
});
export type Voice = z.infer<typeof Voice>;

export const Skill = z.object({
  type: z.literal('skill'),
  ...baseArtifactFields,
  whenToUse: z.string(),
  body: z.string(),
  files: z.array(z.string()).default([]),
});
export type Skill = z.infer<typeof Skill>;

export const TemplateSection = z.object({
  name: z.string(),
  guidance: z.string(),
  tone: z.string().optional(),
  lengthHint: z.string().optional(),
  required: z.boolean().default(true),
  slots: z.array(z.string()).default([]),
});
export type TemplateSection = z.infer<typeof TemplateSection>;

export const Template = z.object({
  type: z.literal('template'),
  ...baseArtifactFields,
  format: z.string(),
  sections: z.array(TemplateSection),
  body: z.string().optional(),
});
export type Template = z.infer<typeof Template>;

export const KnowledgeSource = z.object({
  title: z.string(),
  url: z.string().optional(),
});
export type KnowledgeSource = z.infer<typeof KnowledgeSource>;

export const Knowledge = z.object({
  type: z.literal('knowledge'),
  ...baseArtifactFields,
  body: z.string(),
  sources: z.array(KnowledgeSource).default([]),
});
export type Knowledge = z.infer<typeof Knowledge>;

export const GUARDRAIL_SEVERITIES = ['block', 'warn'] as const;
export const Guardrail = z.object({
  type: z.literal('guardrail'),
  ...baseArtifactFields,
  severity: z.enum(GUARDRAIL_SEVERITIES).default('warn'),
  scope: z.string().optional(),
  body: z.string(),
  violations: z.array(z.string()).default([]),
  compliant: z.array(z.string()).default([]),
});
export type Guardrail = z.infer<typeof Guardrail>;

export const ProductFeature = z.object({
  name: z.string(),
  description: z.string(),
});
export type ProductFeature = z.infer<typeof ProductFeature>;

export const Product = z.object({
  type: z.literal('product'),
  ...baseArtifactFields,
  sku: z.string().optional(),
  audience: z.string().optional(),
  valueProps: z.array(z.string()).default([]),
  features: z.array(ProductFeature).default([]),
  pricing: z.string().optional(),
  links: z.record(z.string()).optional(),
  body: z.string().optional(),
});
export type Product = z.infer<typeof Product>;

export const Value = z.object({
  type: z.literal('value'),
  ...baseArtifactFields,
  body: z.string(),
  example: z.string().optional(),
});
export type Value = z.infer<typeof Value>;

export const PersonSocial = z.object({
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  bluesky: z.string().optional(),
  other: z.record(z.string()).optional(),
});
export type PersonSocial = z.infer<typeof PersonSocial>;

export const Person = z.object({
  type: z.literal('person'),
  ...baseArtifactFields,
  role: z.string(),
  bio: z.string(),
  quote: z.string().optional(),
  email: z.string().optional(),
  imageUrl: z.string().optional(),
  social: PersonSocial.optional(),
  body: z.string().optional(),
});
export type Person = z.infer<typeof Person>;

export const TypefaceFile = z.object({
  weight: z.number().int(),
  style: z.enum(['normal', 'italic']).default('normal'),
  url: z.string(),
  format: z.enum(['woff', 'woff2', 'ttf', 'otf']).optional(),
});
export type TypefaceFile = z.infer<typeof TypefaceFile>;

export const Typeface = z.object({
  family: z.string(),
  role: z.string(),
  stack: z.string().optional(),
  weights: z.array(z.number().int()).default([]),
  source: z
    .object({
      provider: z
        .enum(['google-fonts', 'adobe-fonts', 'self-hosted', 'system'])
        .optional(),
      url: z.string().optional(),
      cssImport: z.string().optional(),
      files: z.array(TypefaceFile).default([]),
    })
    .optional(),
  use: z.string().optional(),
});
export type Typeface = z.infer<typeof Typeface>;

export const TypeScaleStep = z.object({
  name: z.string(),
  fontSize: z.string(),
  lineHeight: z.string().optional(),
  fontWeight: z.number().int().optional(),
  letterSpacing: z.string().optional(),
  use: z.string().optional(),
});
export type TypeScaleStep = z.infer<typeof TypeScaleStep>;

export const Typography = z.object({
  type: z.literal('typography'),
  ...baseArtifactFields,
  typefaces: z.array(Typeface).default([]),
  scale: z.array(TypeScaleStep).default([]),
  body: z.string().optional(),
});
export type Typography = z.infer<typeof Typography>;

export const ColorToken = z.object({
  name: z.string(),
  hex: z.string(),
  role: z.string().optional(),
  use: z.string().optional(),
  contrast: z
    .object({
      onLight: z.string().optional(),
      onDark: z.string().optional(),
    })
    .optional(),
});
export type ColorToken = z.infer<typeof ColorToken>;

export const Palette = z.object({
  type: z.literal('palette'),
  ...baseArtifactFields,
  colors: z.array(ColorToken).default([]),
  body: z.string().optional(),
});
export type Palette = z.infer<typeof Palette>;

export const LogoAsset = z.object({
  variant: z.string(),
  format: z.enum(['svg', 'png', 'pdf', 'eps', 'ai']),
  url: z.string(),
  use: z.string().optional(),
  background: z.enum(['light', 'dark', 'either']).optional(),
});
export type LogoAsset = z.infer<typeof LogoAsset>;

export const Logo = z.object({
  type: z.literal('logo'),
  ...baseArtifactFields,
  assets: z.array(LogoAsset).default([]),
  clearSpace: z.string().optional(),
  minSize: z.string().optional(),
  body: z.string().optional(),
});
export type Logo = z.infer<typeof Logo>;

export const CustomItem = z.object({
  type: z.literal('custom'),
  facetId: z.string().min(1),
  ...baseArtifactFields,
  body: z.string(),
  data: z.record(z.unknown()).default({}),
});
export type CustomItem = z.infer<typeof CustomItem>;

export const Artifact = z.discriminatedUnion('type', [
  Guideline,
  Voice,
  Value,
  Skill,
  Template,
  Knowledge,
  Guardrail,
  Product,
  Person,
  Typography,
  Palette,
  Logo,
  CustomItem,
]);
export type Artifact = z.infer<typeof Artifact>;

export const BrandHq = z.object({
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
});
export type BrandHq = z.infer<typeof BrandHq>;

export const BrandContact = z.object({
  email: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  other: z.record(z.string()).optional(),
});
export type BrandContact = z.infer<typeof BrandContact>;

export const Brand = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().optional(),
  description: z.string().optional(),
  primaryUrl: z.string().optional(),
  urls: z.record(z.string()).default({}),
  mission: z.string().optional(),
  vision: z.string().optional(),
  founded: z.number().int().optional(),
  hq: BrandHq.optional(),
  contact: BrandContact.optional(),
  primaryVoiceId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
export type Brand = z.infer<typeof Brand>;

export const ARTIFACT_DIRS: Record<Exclude<ArtifactType, 'custom'>, string> = {
  guideline: 'guidelines',
  voice: 'voices',
  value: 'values',
  skill: 'skills',
  template: 'templates',
  knowledge: 'knowledge',
  guardrail: 'guardrails',
  product: 'products',
  person: 'people',
  typography: 'typography',
  palette: 'palettes',
  logo: 'logos',
};
