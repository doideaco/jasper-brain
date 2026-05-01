import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FilesystemStore, type Brand, type Guideline, type Skill } from '../src/index.js';

let tmpRoot: string;
let store: FilesystemStore;

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'brain-write-'));
  store = new FilesystemStore(tmpRoot);
});

afterEach(async () => {
  await fs.rm(tmpRoot, { recursive: true, force: true });
});

describe('FilesystemStore writes', () => {
  it('creates a brand from scratch and reads it back', async () => {
    const brand: Brand = {
      id: 'newco',
      name: 'NewCo',
      description: 'A brand created by the test.',
      tags: ['fixture'],
      primaryVoiceId: 'default',
    };
    await store.putBrand(brand);
    const loaded = await store.getBrand('newco');
    expect(loaded).toMatchObject({ id: 'newco', name: 'NewCo' });
  });

  it('writes a guideline and reads it back identically', async () => {
    await store.putBrand({ id: 'newco', name: 'NewCo', tags: [] });
    const guideline: Guideline = {
      type: 'guideline',
      id: 'be-direct',
      name: 'Be direct',
      description: 'Cut filler words.',
      version: '1',
      tags: ['copy'],
      body: 'Filler words steal energy from the sentence.',
      examples: { do: ['Ship.'], dont: ['We are pleased to announce.'] },
    };
    await store.putArtifact('newco', guideline);
    const loaded = await store.getArtifact('newco', 'guideline', 'be-direct');
    if (loaded.type !== 'guideline') throw new Error('expected guideline');
    expect(loaded.name).toBe('Be direct');
    expect(loaded.examples?.do).toEqual(['Ship.']);
    expect(loaded.body).toMatch(/filler/i);
  });

  it('writes a skill into its own folder with SKILL.md', async () => {
    await store.putBrand({ id: 'newco', name: 'NewCo', tags: [] });
    const skill: Skill = {
      type: 'skill',
      id: 'write-changelog',
      name: 'Write a changelog entry',
      description: 'Draft a one-paragraph changelog.',
      version: '1',
      tags: ['writing'],
      whenToUse: 'When shipping a public-facing change.',
      body: 'Lead with the user-visible change.',
      files: [],
    };
    await store.putArtifact('newco', skill);
    const file = path.join(tmpRoot, 'newco', 'skills', 'write-changelog', 'SKILL.md');
    expect((await fs.stat(file)).isFile()).toBe(true);
    const loaded = await store.getArtifact('newco', 'skill', 'write-changelog');
    if (loaded.type !== 'skill') throw new Error('expected skill');
    expect(loaded.whenToUse).toMatch(/public-facing/);
  });

  it('round-trips every artifact type without dropping fields', async () => {
    await store.putBrand({ id: 'newco', name: 'NewCo', tags: [] });
    const original: Guideline = {
      type: 'guideline',
      id: 'rt-test',
      name: 'Round trip',
      description: 'Round trip test.',
      version: '2',
      tags: ['a', 'b'],
      body: 'Body.\n\nWith two paragraphs.',
      scope: 'all copy',
      examples: { do: ['Yes.'], dont: ['No.'] },
    };
    await store.putArtifact('newco', original);
    const loaded = await store.getArtifact('newco', 'guideline', 'rt-test');
    if (loaded.type !== 'guideline') throw new Error('expected guideline');
    expect(loaded.scope).toBe('all copy');
    expect(loaded.tags).toEqual(['a', 'b']);
    expect(loaded.version).toBe('2');
    expect(loaded.body.trim()).toBe(original.body.trim());
  });

  it('overwrites an existing artifact in place', async () => {
    await store.putBrand({ id: 'newco', name: 'NewCo', tags: [] });
    const v1: Guideline = {
      type: 'guideline', id: 'upd', name: 'V1', version: '1',
      tags: [], body: 'first',
    };
    await store.putArtifact('newco', v1);
    await store.putArtifact('newco', { ...v1, name: 'V2', body: 'second' });
    const loaded = await store.getArtifact('newco', 'guideline', 'upd');
    expect(loaded.name).toBe('V2');
    if (loaded.type !== 'guideline') throw new Error('expected guideline');
    expect(loaded.body).toBe('second');
  });

  it('deletes a single artifact', async () => {
    await store.putBrand({ id: 'newco', name: 'NewCo', tags: [] });
    const g: Guideline = {
      type: 'guideline', id: 'goner', name: 'Goner', version: '1', tags: [], body: 'x',
    };
    await store.putArtifact('newco', g);
    await store.deleteArtifact('newco', 'guideline', 'goner');
    await expect(
      store.getArtifact('newco', 'guideline', 'goner'),
    ).rejects.toThrow(/not found/i);
  });

  it('deletes a skill folder including supporting files', async () => {
    await store.putBrand({ id: 'newco', name: 'NewCo', tags: [] });
    await store.putArtifact('newco', {
      type: 'skill', id: 'doomed', name: 'Doomed', version: '1', tags: [],
      whenToUse: 'never', body: 'gone', files: [],
    });
    const skillDir = path.join(tmpRoot, 'newco', 'skills', 'doomed');
    await fs.writeFile(path.join(skillDir, 'extra.txt'), 'aux');
    await store.deleteArtifact('newco', 'skill', 'doomed');
    await expect(fs.stat(skillDir)).rejects.toThrow();
  });

  it('deletes an entire brand', async () => {
    await store.putBrand({ id: 'goneco', name: 'GoneCo', tags: [] });
    await store.deleteBrand('goneco');
    await expect(store.getBrand('goneco')).rejects.toThrow(/not found/i);
  });
});
