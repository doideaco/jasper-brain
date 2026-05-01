import type { FacetDefinition } from './facets.js';
import type { BrainStore } from './storage.js';
import type {
  Artifact,
  Brand,
  Guardrail,
  Logo,
  Palette,
  Person,
  Skill,
  Template,
  Typography,
  Value,
  Voice,
} from './types.js';

export interface BrandKitItemSummary {
  id: string;
  name: string;
  description?: string;
}

export interface BrandKitSkillSummary extends BrandKitItemSummary {
  whenToUse: string;
}

export interface BrandKitTemplateSummary extends BrandKitItemSummary {
  format: string;
}

export interface FacetInstruction {
  id: string;
  label: string;
  group: string;
  /** Behavioural instructions — how the AI should use items in this facet. */
  aiInstructions: string;
}

export interface BrandKit {
  brand: Brand;
  /**
   * Per-facet behavioural instructions for the AI. Read these first —
   * they describe what each facet is and how to use it. Custom facets
   * carry their own brand-defined instructions.
   */
  instructions: FacetInstruction[];
  voice?: Voice;
  values: Value[];
  visual: {
    typography?: Typography;
    palette?: Palette;
    logo?: Logo;
  };
  guardrails: Guardrail[];
  people: Person[];
  available: {
    skills: BrandKitSkillSummary[];
    templates: BrandKitTemplateSummary[];
    knowledge: BrandKitItemSummary[];
    products: BrandKitItemSummary[];
  };
}

/**
 * Pick the "primary" item of a given facet:
 *   1. Item explicitly tagged 'primary'
 *   2. Item with id 'default'
 *   3. First item
 */
function pickPrimary<T extends Artifact>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return (
    items.find((item) => item.tags.includes('primary')) ??
    items.find((item) => item.id === 'default') ??
    items[0]
  );
}

function summarise(item: Artifact): BrandKitItemSummary {
  return { id: item.id, name: item.name, description: item.description };
}

/**
 * Bundle everything an AI tool needs to author on-brand content for a brand,
 * in one structured payload.
 */
export async function getBrandKit(
  store: BrainStore,
  brandId: string,
): Promise<BrandKit> {
  const brand = await store.getBrand(brandId);
  const [items, facets] = await Promise.all([
    store.listArtifacts(brandId),
    store.listFacets(brandId),
  ]);

  const instructions: FacetInstruction[] = facets
    .filter((f) => f.aiInstructions && f.aiInstructions.trim())
    .map((f) => ({
      id: f.id,
      label: f.pluralLabel,
      group: f.group,
      aiInstructions: f.aiInstructions,
    }));

  const voices = items.filter((i): i is Voice => i.type === 'voice');
  const voice = brand.primaryVoiceId
    ? voices.find((v) => v.id === brand.primaryVoiceId) ?? pickPrimary(voices)
    : pickPrimary(voices);

  const values = items.filter((i): i is Value => i.type === 'value');
  const guardrails = items.filter((i): i is Guardrail => i.type === 'guardrail');
  const people = items.filter((i): i is Person => i.type === 'person');

  const typography = pickPrimary(
    items.filter((i): i is Typography => i.type === 'typography'),
  );
  const palette = pickPrimary(
    items.filter((i): i is Palette => i.type === 'palette'),
  );
  const logo = pickPrimary(items.filter((i): i is Logo => i.type === 'logo'));

  const skills = items.filter((i): i is Skill => i.type === 'skill');
  const templates = items.filter((i): i is Template => i.type === 'template');
  const knowledge = items.filter((i) => i.type === 'knowledge');
  const products = items.filter((i) => i.type === 'product');

  return {
    brand,
    instructions,
    voice,
    values,
    visual: { typography, palette, logo },
    guardrails,
    people,
    available: {
      skills: skills.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        whenToUse: s.whenToUse,
      })),
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        format: t.format,
      })),
      knowledge: knowledge.map(summarise),
      products: products.map(summarise),
    },
  };
}
