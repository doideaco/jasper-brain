import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ARTIFACT_TYPES, FilesystemStore } from '../src/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.join(here, 'fixtures');

describe('FilesystemStore — happy path', () => {
  const store = new FilesystemStore(fixturesRoot);

  it('lists every brand directory that has a brand.yaml', async () => {
    const brands = await store.listBrands();
    const ids = brands.map((b) => b.id).sort();
    expect(ids).toEqual(['broken-brand', 'good-brand']);
  });

  it('loads brand metadata from yaml', async () => {
    const brand = await store.getBrand('good-brand');
    expect(brand.name).toBe('Good Brand');
    expect(brand.primaryVoiceId).toBe('default');
  });

  it('loads one of every artifact type', async () => {
    const artifacts = await store.listArtifacts('good-brand');
    const types = new Set(artifacts.map((a) => a.type));
    const builtInTypes = ARTIFACT_TYPES.filter((t) => t !== 'custom');
    for (const type of builtInTypes) {
      expect(types.has(type), `missing ${type}`).toBe(true);
    }
    expect(artifacts).toHaveLength(builtInTypes.length);
  });

  it('parses skill frontmatter and finds supporting files', async () => {
    const skill = await store.getArtifact('good-brand', 'skill', 'example-skill');
    if (skill.type !== 'skill') throw new Error('expected skill');
    expect(skill.whenToUse).toMatch(/test/i);
    expect(skill.files).toContain('extra.txt');
  });

  it('parses template sections as structured data', async () => {
    const template = await store.getArtifact('good-brand', 'template', 'email');
    if (template.type !== 'template') throw new Error('expected template');
    expect(template.format).toBe('email');
    expect(template.sections).toHaveLength(2);
    expect(template.sections[0].name).toBe('Subject');
  });

  it('parses guardrail severity and example arrays', async () => {
    const guardrail = await store.getArtifact('good-brand', 'guardrail', 'no-fake-stats');
    if (guardrail.type !== 'guardrail') throw new Error('expected guardrail');
    expect(guardrail.severity).toBe('block');
    expect(guardrail.violations[0]).toMatch(/1 million/);
  });

  it('parses product valueProps and features', async () => {
    const product = await store.getArtifact('good-brand', 'product', 'widget');
    if (product.type !== 'product') throw new Error('expected product');
    expect(product.valueProps).toHaveLength(2);
    expect(product.features.map((f) => f.name)).toEqual(['Speedy', 'Pretty']);
  });

  it('filters list by tag', async () => {
    const tagged = await store.listArtifacts('good-brand', { tag: 'primary' });
    expect(tagged).toHaveLength(1);
    expect(tagged[0].id).toBe('default');
  });

  it('ranks search hits by relevance', async () => {
    const hits = await store.search('good-brand', 'specific');
    expect(hits[0]?.id).toBe('be-specific');
  });

  it('returns empty array for empty query', async () => {
    expect(await store.search('good-brand', '   ')).toEqual([]);
  });
});

describe('FilesystemStore — error and edge cases', () => {
  const store = new FilesystemStore(fixturesRoot);

  it('throws a clear error for an unknown brand', async () => {
    await expect(store.getBrand('does-not-exist')).rejects.toThrow(/not found/i);
  });

  it('throws a clear error for an unknown artifact', async () => {
    await expect(store.getArtifact('good-brand', 'voice', 'nope')).rejects.toThrow(
      /not found/i,
    );
  });

  it('skips non-markdown files in artifact directories', async () => {
    const artifacts = await store.listArtifacts('good-brand', { facetId: 'guideline' });
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0].id).toBe('be-specific');
  });

  it('skips skill directories without a SKILL.md', async () => {
    const artifacts = await store.listArtifacts('broken-brand', { facetId: 'skill' });
    expect(artifacts).toEqual([]);
  });

  it('fails loudly when an artifact file is malformed', async () => {
    await expect(
      store.listArtifacts('broken-brand', { facetId: 'guideline' }),
    ).rejects.toThrow();
  });

  it('returns an empty list for a brand with no artifacts of a type', async () => {
    const tagged = await store.listArtifacts('good-brand', { tag: 'nonexistent' });
    expect(tagged).toEqual([]);
  });
});
