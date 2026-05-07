import matter from 'gray-matter';
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
  type ArtifactType,
} from './types.js';

export function serializeArtifact(artifact: Artifact): string {
  const { type, body, ...rest } = artifact as Artifact & { body?: string };
  let frontmatter: Record<string, unknown> = stripUndefined(rest);
  if (type === 'skill') {
    const { files: _files, ...skillRest } = frontmatter;
    frontmatter = skillRest;
  }
  if (type === 'custom') {
    const { data, facetId: _facetId, ...customRest } = frontmatter as Record<string, unknown>;
    frontmatter = customRest;
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      Object.assign(frontmatter, data);
    }
  }
  const bodyText = typeof body === 'string' ? body : '';
  return matter.stringify(bodyText, frontmatter);
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  return out as T;
}

export function parseArtifact(
  raw: string,
  type: ArtifactType,
  fallbackId: string,
  facetId?: string,
): Artifact {
  const { data, content } = matter(raw);
  const merged = {
    type,
    id: data.id ?? fallbackId,
    name: data.name ?? fallbackId,
    description: data.description,
    version: data.version,
    tags: data.tags,
    updatedAt: data.updatedAt,
    body: content.trim(),
    ...stripBaseFields(data),
  };

  switch (type) {
    case 'guideline':
      return Guideline.parse(merged);
    case 'voice':
      return Voice.parse(merged);
    case 'skill':
      return Skill.parse({ ...merged, whenToUse: data.whenToUse ?? data.description ?? '' });
    case 'template':
      return Template.parse(merged);
    case 'knowledge':
      return Knowledge.parse(merged);
    case 'guardrail':
      return Guardrail.parse(merged);
    case 'product':
      return Product.parse(merged);
    case 'value':
      return Value.parse(merged);
    case 'person':
      return Person.parse(merged);
    case 'typography':
      return Typography.parse(merged);
    case 'palette':
      return Palette.parse(merged);
    case 'logo':
      return Logo.parse(merged);
    case 'texture':
      return Texture.parse(merged);
    case 'faq':
      return Faq.parse(merged);
    case 'custom': {
      if (!facetId) throw new Error('Custom items must specify a facetId.');
      const known = ['id', 'name', 'description', 'version', 'tags', 'updatedAt'];
      const arbitrary: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (!known.includes(key) && key !== 'type' && key !== 'facetId') {
          arbitrary[key] = value;
        }
      }
      return CustomItem.parse({
        ...merged,
        facetId,
        data: data.data ?? arbitrary,
      });
    }
  }
}

function stripBaseFields(data: Record<string, unknown>): Record<string, unknown> {
  const { id, name, description, version, tags, updatedAt, type, body, ...rest } = data;
  return rest;
}
