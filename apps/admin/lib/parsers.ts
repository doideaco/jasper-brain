import {
  Artifact,
  CustomItem,
  Faq,
  Guardrail,
  Guideline,
  Knowledge,
  Logo,
  Palette,
  Person,
  Product,
  Skill,
  Template,
  Texture,
  Typography,
  Value,
  Voice,
  type FacetDefinition,
} from '@jasper-brain/core';
import {
  getString,
  getYaml,
  requireString,
  splitLines,
  splitTags,
} from './form-helpers';

export function parseArtifactForm(facet: FacetDefinition, fd: FormData): Artifact {
  if (!facet.builtIn) return parseCustom(facet.id, fd);
  switch (facet.id) {
    case 'guideline':
      return parseGuideline(fd);
    case 'voice':
      return parseVoice(fd);
    case 'skill':
      return parseSkill(fd);
    case 'template':
      return parseTemplate(fd);
    case 'knowledge':
      return parseKnowledge(fd);
    case 'guardrail':
      return parseGuardrail(fd);
    case 'product':
      return parseProduct(fd);
    case 'value':
      return parseValue(fd);
    case 'person':
      return parsePerson(fd);
    case 'typography':
      return parseTypography(fd);
    case 'palette':
      return parsePalette(fd);
    case 'logo':
      return parseLogo(fd);
    case 'texture':
      return parseTexture(fd);
    case 'faq':
      return parseFaq(fd);
    default:
      throw new Error(`Unknown built-in facet: ${facet.id}`);
  }
}

function baseFields(fd: FormData) {
  return {
    id: requireString(fd, 'id'),
    name: requireString(fd, 'name'),
    description: getString(fd, 'description'),
    version: getString(fd, 'version') ?? '1',
    tags: splitTags(fd.get('tags')),
  };
}

function parseGuideline(fd: FormData): Guideline {
  return Guideline.parse({
    type: 'guideline',
    ...baseFields(fd),
    scope: getString(fd, 'scope'),
    body: requireString(fd, 'body'),
    examples: {
      do: splitLines(fd.get('examples.do')),
      dont: splitLines(fd.get('examples.dont')),
    },
  });
}

function parseVoice(fd: FormData): Voice {
  return Voice.parse({
    type: 'voice',
    ...baseFields(fd),
    tone: splitLines(fd.get('tone')),
    vocabulary: {
      prefer: splitLines(fd.get('vocabulary.prefer')),
      avoid: splitLines(fd.get('vocabulary.avoid')),
    },
    body: requireString(fd, 'body'),
  });
}

function parseSkill(fd: FormData): Skill {
  return Skill.parse({
    type: 'skill',
    ...baseFields(fd),
    whenToUse: requireString(fd, 'whenToUse'),
    body: requireString(fd, 'body'),
    files: [],
  });
}

function parseTemplate(fd: FormData): Template {
  const sections = getYaml<unknown[]>(fd, 'sections');
  const renderAsRaw = getString(fd, 'renderAs');
  const scaffoldRaw = getString(fd, 'scaffold');
  return Template.parse({
    type: 'template',
    ...baseFields(fd),
    format: requireString(fd, 'format'),
    renderAs: renderAsRaw && renderAsRaw.length > 0 ? renderAsRaw : undefined,
    sections: sections ?? [],
    scaffold: scaffoldRaw && scaffoldRaw.length > 0 ? scaffoldRaw : undefined,
    body: getString(fd, 'body'),
  });
}

function parseKnowledge(fd: FormData): Knowledge {
  return Knowledge.parse({
    type: 'knowledge',
    ...baseFields(fd),
    body: requireString(fd, 'body'),
    sources: getYaml(fd, 'sources') ?? [],
  });
}

function parseGuardrail(fd: FormData): Guardrail {
  const severity = getString(fd, 'severity') ?? 'warn';
  return Guardrail.parse({
    type: 'guardrail',
    ...baseFields(fd),
    severity,
    scope: getString(fd, 'scope'),
    body: requireString(fd, 'body'),
    violations: splitLines(fd.get('violations')),
    compliant: splitLines(fd.get('compliant')),
  });
}

function parseValue(fd: FormData): Value {
  return Value.parse({
    type: 'value',
    ...baseFields(fd),
    body: requireString(fd, 'body'),
    example: getString(fd, 'example'),
  });
}

function parsePerson(fd: FormData): Person {
  return Person.parse({
    type: 'person',
    ...baseFields(fd),
    role: requireString(fd, 'role'),
    bio: requireString(fd, 'bio'),
    quote: getString(fd, 'quote'),
    email: getString(fd, 'email'),
    imageUrl: getString(fd, 'imageUrl'),
    social: getYaml(fd, 'social'),
    body: getString(fd, 'body'),
  });
}

function parseTypography(fd: FormData): Typography {
  return Typography.parse({
    type: 'typography',
    ...baseFields(fd),
    typefaces: getYaml(fd, 'typefaces') ?? [],
    scale: getYaml(fd, 'scale') ?? [],
    body: getString(fd, 'body'),
  });
}

function parsePalette(fd: FormData): Palette {
  return Palette.parse({
    type: 'palette',
    ...baseFields(fd),
    colors: getYaml(fd, 'colors') ?? [],
    body: getString(fd, 'body'),
  });
}

function parseFaq(fd: FormData): Faq {
  return Faq.parse({
    type: 'faq',
    ...baseFields(fd),
    question: requireString(fd, 'question'),
    answer: requireString(fd, 'answer'),
    shortAnswer: getString(fd, 'shortAnswer'),
    sources: getYaml(fd, 'sources') ?? [],
    category: getString(fd, 'category'),
    body: getString(fd, 'body'),
  });
}

function parseTexture(fd: FormData): Texture {
  const bg = getString(fd, 'background') ?? 'either';
  return Texture.parse({
    type: 'texture',
    ...baseFields(fd),
    css: requireString(fd, 'css'),
    background: bg,
    use: getString(fd, 'use'),
    body: getString(fd, 'body'),
  });
}

function parseLogo(fd: FormData): Logo {
  return Logo.parse({
    type: 'logo',
    ...baseFields(fd),
    assets: getYaml(fd, 'assets') ?? [],
    clearSpace: getString(fd, 'clearSpace'),
    minSize: getString(fd, 'minSize'),
    body: getString(fd, 'body'),
  });
}

function parseCustom(facetId: string, fd: FormData): CustomItem {
  return CustomItem.parse({
    type: 'custom',
    facetId,
    ...baseFields(fd),
    body: requireString(fd, 'body'),
    data: getYaml<Record<string, unknown>>(fd, 'data') ?? {},
  });
}

function parseProduct(fd: FormData): Product {
  return Product.parse({
    type: 'product',
    ...baseFields(fd),
    sku: getString(fd, 'sku'),
    audience: getString(fd, 'audience'),
    valueProps: splitLines(fd.get('valueProps')),
    features: getYaml(fd, 'features') ?? [],
    pricing: getString(fd, 'pricing'),
    links: getYaml(fd, 'links'),
    body: getString(fd, 'body'),
  });
}
