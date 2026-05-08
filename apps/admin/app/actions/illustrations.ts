'use server';

import { generateText } from 'ai';
import { revalidatePath } from 'next/cache';
import { Illustration } from '@jasper-brain/core';
import { requireAdmin, requireUser } from '@/lib/auth';
import { detectMime, uploadFile } from '@/lib/blob';
import { requireString } from '@/lib/form-helpers';
import { getStore } from '@/lib/store';

export interface BulkUploadResult {
  ok: boolean;
  message: string;
  uploaded?: number;
  itemsCreated?: number;
  errors?: string[];
}

const SUPPORTED_FORMATS = new Set([
  'webp',
  'png',
  'svg',
  'jpg',
  'jpeg',
  'gif',
]);

function illustrationIdFromFilename(name: string): string {
  const stem = name.replace(/\.[^.]+$/, '').trim();
  const id = stem
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return id || `illustration-${Date.now()}`;
}

function illustrationNameFromFilename(name: string): string {
  const stem = name.replace(/\.[^.]+$/, '').trim();
  return stem || 'Illustration';
}

function formatFromExt(name: string): string | null {
  const ext = name.split('.').pop()?.toLowerCase();
  if (!ext) return null;
  return SUPPORTED_FORMATS.has(ext) ? ext : null;
}

export async function bulkCreateIllustrations(
  _prev: BulkUploadResult | null,
  formData: FormData,
): Promise<BulkUploadResult> {
  try {
    await requireUser();
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unauthorized.',
    };
  }

  let brandId: string;
  try {
    brandId = requireString(formData, 'brandId');
  } catch {
    return { ok: false, message: 'brandId missing.' };
  }

  const files = formData.getAll('files').filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return { ok: false, message: 'No files attached.' };
  }

  const store = await getStore();
  const errors: string[] = [];
  let uploadedCount = 0;
  let itemsCreatedCount = 0;

  // Pull existing ids upfront so we don't accidentally overwrite an
  // existing illustration with the same filename. Generate a new id
  // with a numeric suffix for collisions.
  const existing = await store.listArtifacts(brandId, {
    facetId: 'illustration',
  });
  const existingIds = new Set(existing.map((e) => e.id));
  function uniqueId(base: string): string {
    if (!existingIds.has(base)) {
      existingIds.add(base);
      return base;
    }
    for (let n = 2; n < 10_000; n++) {
      const candidate = `${base}-${n}`;
      if (!existingIds.has(candidate)) {
        existingIds.add(candidate);
        return candidate;
      }
    }
    throw new Error(`Could not allocate unique id for ${base}`);
  }

  for (const file of files) {
    if (file.size === 0) continue;
    if (file.size > 25 * 1024 * 1024) {
      errors.push(`${file.name}: larger than 25 MB, skipped.`);
      continue;
    }
    const format = formatFromExt(file.name);
    if (!format) {
      errors.push(`${file.name}: unsupported format, skipped.`);
      continue;
    }

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const asset = await uploadFile(
        brandId,
        file.name,
        bytes,
        file.type || detectMime(file.name),
      );
      uploadedCount += 1;

      const id = uniqueId(illustrationIdFromFilename(file.name));
      const item = Illustration.parse({
        type: 'illustration',
        id,
        name: illustrationNameFromFilename(file.name),
        version: '1',
        tags: [],
        assets: [
          {
            format,
            url: asset.url,
            background: 'either',
          },
        ],
        mood: [],
        pairsWith: [],
      });
      await store.putArtifact(brandId, item);
      itemsCreatedCount += 1;
    } catch (err) {
      errors.push(
        `${file.name}: ${err instanceof Error ? err.message : 'failed'}`,
      );
    }
  }

  revalidatePath(`/brands/${brandId}/illustration`);
  revalidatePath(`/brands/${brandId}/assets`);

  return {
    ok: itemsCreatedCount > 0,
    message:
      itemsCreatedCount > 0
        ? `Uploaded ${uploadedCount} files and created ${itemsCreatedCount} illustration items.`
        : 'No illustrations were created.',
    uploaded: uploadedCount,
    itemsCreated: itemsCreatedCount,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────
// AI auto-tag
// Uses the Vercel AI Gateway (anthropic/claude-sonnet-4.5 by default)
// to look at each illustration and propose mood / subject / use /
// pairsWith. Idempotent — only tags illustrations that don't already
// have a mood set.
// ─────────────────────────────────────────────────────────────────────

export interface AutoTagResult {
  ok: boolean;
  message: string;
  tagged?: number;
  skipped?: number;
  errors?: string[];
}

const AUTO_TAG_SYSTEM = `You categorise editorial illustrations for a brand library. Given an image, return a JSON object with these fields:

  {
    "mood": [string, ...],            // 1-3 vibe descriptors. Examples: "playful", "energetic", "abstract", "quiet", "editorial", "geometric", "organic", "celebratory", "soft", "bold".
    "subject": string,                 // a single concept describing what the illustration depicts. Lowercase, hyphenated. Examples: "eye", "flower", "sunburst", "abstract-geometric", "intersecting-shapes".
    "use": string,                     // one of "Hero only", "Inline accent", "Section break", or a short phrase if none fit.
    "pairsWith": [string, ...]         // 1-3 palette token names that pair well. Pick from this list, no others: ["Brand", "Brand-50", "Ink", "Stone-700", "Stone-500", "Surface", "Card", "Success", "Warning", "Danger"].
  }

Return JSON only — no prose, no markdown fences, no commentary.`;

interface AutoTagJson {
  mood?: string[];
  subject?: string;
  use?: string;
  pairsWith?: string[];
}

function tryParseAutoTag(text: string): AutoTagJson | null {
  // Strip a leading ```json fence if the model added one despite the prompt.
  const stripped = text
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    const parsed = JSON.parse(stripped);
    if (parsed && typeof parsed === 'object') return parsed as AutoTagJson;
  } catch {
    // ignore
  }
  return null;
}

async function tagOneIllustration(
  imageUrl: string,
): Promise<AutoTagJson | null> {
  const model = process.env.PLAYGROUND_MODEL ?? 'anthropic/claude-sonnet-4.5';

  // Resolve relative URL (/api/files/...) to absolute for the model.
  let absoluteUrl = imageUrl;
  if (imageUrl.startsWith('/')) {
    const base =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.VERCEL_PROJECT_PRODUCTION_URL ??
      process.env.VERCEL_URL;
    if (!base) return null;
    const origin = base.startsWith('http') ? base : `https://${base}`;
    absoluteUrl = `${origin}${imageUrl}`;
  }

  const result = await generateText({
    model,
    system: AUTO_TAG_SYSTEM,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: new URL(absoluteUrl),
          },
          {
            type: 'text',
            text: 'Categorise this illustration. Return JSON only.',
          },
        ],
      },
    ],
    temperature: 0.2,
  });

  return tryParseAutoTag(result.text);
}

export async function autoTagIllustrations(
  _prev: AutoTagResult | null,
  formData: FormData,
): Promise<AutoTagResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unauthorized.',
    };
  }

  let brandId: string;
  try {
    brandId = requireString(formData, 'brandId');
  } catch {
    return { ok: false, message: 'brandId missing.' };
  }

  const onlyUntagged = formData.get('mode') !== 'all';

  const store = await getStore();
  const items = await store.listArtifacts(brandId, {
    facetId: 'illustration',
  });

  const candidates = items.filter((i): i is Extract<typeof i, { type: 'illustration' }> => {
    if (i.type !== 'illustration') return false;
    if (i.assets.length === 0) return false;
    if (onlyUntagged && i.mood.length > 0) return false;
    return true;
  });

  if (candidates.length === 0) {
    return {
      ok: true,
      message: onlyUntagged
        ? 'No untagged illustrations found.'
        : 'No illustrations to tag.',
      tagged: 0,
      skipped: items.length - candidates.length,
    };
  }

  const errors: string[] = [];
  let tagged = 0;

  // Sequential to keep API rate sensible. ~145 items × ~1s each = ~2.5min.
  for (const item of candidates) {
    if (item.type !== 'illustration') continue;
    const url = item.assets[0]?.url;
    if (!url) continue;

    try {
      const result = await tagOneIllustration(url);
      if (!result) {
        errors.push(`${item.id}: model returned no usable JSON`);
        continue;
      }
      const updated = Illustration.parse({
        ...item,
        mood: Array.isArray(result.mood) ? result.mood.slice(0, 5) : item.mood,
        subject: typeof result.subject === 'string' ? result.subject : item.subject,
        use: typeof result.use === 'string' ? result.use : item.use,
        pairsWith: Array.isArray(result.pairsWith)
          ? result.pairsWith.slice(0, 5)
          : item.pairsWith,
      });
      await store.putArtifact(brandId, updated);
      tagged += 1;
    } catch (err) {
      errors.push(`${item.id}: ${err instanceof Error ? err.message : 'failed'}`);
    }
  }

  revalidatePath(`/brands/${brandId}/illustration`);

  return {
    ok: tagged > 0,
    message: `Tagged ${tagged} illustration${tagged === 1 ? '' : 's'}${
      onlyUntagged ? ' (untagged only)' : ''
    }.`,
    tagged,
    skipped: items.length - candidates.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}
