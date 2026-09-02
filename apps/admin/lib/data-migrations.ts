/**
 * Targeted, idempotent data migrations.
 *
 * The add-only seed-sync (lib/seed-sync.ts) preserves rows that already
 * exist in the DB so we never clobber hand-edited records (uploaded
 * font URLs, attached logo SVGs, etc.). The trade-off is that fields
 * touched in newer seed pushes (rebrand colour swap, type-system
 * cleanup) never land in the deployed Postgres.
 *
 * This module addresses that with surgical migrations: each one
 * inspects current DB content and patches only fields that match the
 * known-stale value, leaving anything else (including custom user
 * edits) alone.
 *
 * Migrations run on every cold start. After first successful run, the
 * stale values no longer exist in the DB, so subsequent runs are
 * no-ops.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import {
  Brand,
  parseArtifact,
  type WritableBrainStore,
} from '@jasper-brain/core';
import { findBrandsDir } from '@/lib/seed-sync';

export interface MigrationResult {
  applied: string[];
  errors: string[];
}

export async function applyDataMigrations(
  store: WritableBrainStore,
  brandId: string,
): Promise<MigrationResult> {
  const applied: string[] = [];
  const errors: string[] = [];

  // ───────────────────────────────────────────────────────────────────
  // Migration: rebrand-2026-05 — Jasper Brand purple → red
  // ───────────────────────────────────────────────────────────────────
  try {
    const palette = await store.getArtifact(brandId, 'palette', 'default');
    if (palette.type === 'palette') {
      let changed = false;
      const updatedColors = palette.colors.map((c) => {
        const hexLower = c.hex.toLowerCase();
        if (hexLower === '#7c3aed') {
          changed = true;
          return { ...c, hex: '#FA4028' };
        }
        if (hexLower === '#f5f3ff') {
          changed = true;
          return { ...c, hex: '#FFE9E4' };
        }
        return c;
      });

      let updatedBody = palette.body ?? '';
      if (updatedBody.includes('Brand purple')) {
        updatedBody = updatedBody.split('Brand purple').join('Brand red');
        changed = true;
      }

      if (changed) {
        await store.putArtifact(brandId, {
          ...palette,
          colors: updatedColors,
          body: updatedBody,
        });
        applied.push(`${brandId}/palette/default: rebrand purple → red`);
      }
    }
  } catch (err) {
    errors.push(
      `palette migration: ${err instanceof Error ? err.message : 'failed'}`,
    );
  }

  // ───────────────────────────────────────────────────────────────────
  // Migration: typography-2026-05 — strip stale Tiempos Headline refs
  // ───────────────────────────────────────────────────────────────────
  try {
    const typography = await store.getArtifact(brandId, 'typography', 'default');
    if (typography.type === 'typography') {
      let changed = false;

      const updatedScale = typography.scale.map((step) => {
        const use = step.use ?? '';
        if (/Tiempos\s+Headline/i.test(use)) {
          changed = true;
          // Remove "Tiempos Headline." (and any trailing whitespace/period)
          // but preserve the rest of the use string.
          const cleaned = use
            .replace(/\.?\s*Tiempos\s+Headline\.?/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
          return { ...step, use: cleaned };
        }
        return step;
      });

      // Also strip any mention from typography body (markdown).
      let updatedBody = typography.body ?? '';
      if (/Tiempos\s+Headline/i.test(updatedBody)) {
        updatedBody = updatedBody.replace(/Tiempos\s+Headline/gi, 'Feature Display');
        changed = true;
      }

      if (changed) {
        await store.putArtifact(brandId, {
          ...typography,
          scale: updatedScale,
          body: updatedBody,
        });
        applied.push(
          `${brandId}/typography/default: stripped Tiempos refs (${updatedScale.length} scale steps inspected)`,
        );
      }
    }
  } catch (err) {
    errors.push(
      `typography migration: ${err instanceof Error ? err.message : 'failed'}`,
    );
  }

  // ───────────────────────────────────────────────────────────────────
  // Migration: rename-2026-05-11 — Brain → Signal rename.
  // Patches user-visible copy in seed-driven items that drifted when
  // the product was renamed.
  // ───────────────────────────────────────────────────────────────────
  try {
    const value = await store.getArtifact(
      brandId,
      'value',
      'plain-over-clever',
    );
    if (value.type === 'value') {
      let changed = false;
      let example = value.example ?? '';
      if (example.includes('"Brain"') || example.includes('Brain is what it is')) {
        example = example
          .split('"Brain"').join('"Signal"')
          .split('Brain is what it is').join('Signal is what it is');
        changed = true;
      }
      if (changed) {
        await store.putArtifact(brandId, { ...value, example });
        applied.push(`${brandId}/value/plain-over-clever: Brain → Signal in example`);
      }
    }
  } catch (err) {
    if (err instanceof Error && !/not found/i.test(err.message)) {
      errors.push(`value/plain-over-clever rename: ${err.message}`);
    }
  }

  try {
    const product = await store.getArtifact(brandId, 'product', 'brand-voice');
    if (product.type === 'product') {
      let changed = false;
      const features = (product.features ?? []).map((f) => {
        if (f.name === 'Brain integration') {
          changed = true;
          return {
            ...f,
            name: 'Signal integration',
            description: f.description.replace(
              /part of Brain/g,
              'part of Signal',
            ),
          };
        }
        return f;
      });
      let body = product.body ?? '';
      if (body.includes('foundation of Brain')) {
        body = body.split('foundation of Brain').join('foundation of Signal');
        changed = true;
      }
      if (changed) {
        await store.putArtifact(brandId, { ...product, features, body });
        applied.push(
          `${brandId}/product/brand-voice: Brain → Signal in features + body`,
        );
      }
    }
  } catch (err) {
    if (err instanceof Error && !/not found/i.test(err.message)) {
      errors.push(`product/brand-voice rename: ${err.message}`);
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // Migration: logo-asset-variant-url-swap-2026-09 — heal logo assets
  // where the URL was pasted into the `variant` field, leaving `url`
  // empty. The editor's Variant input sits above the URL input, so a
  // hurried paste lands in the wrong slot; the resulting artifact
  // renders as a broken <img> on /share/<brand>. Idempotent.
  // ───────────────────────────────────────────────────────────────────
  try {
    const logos = await store.listArtifacts(brandId, { facetId: 'logo' });
    for (const logo of logos) {
      if (logo.type !== 'logo') continue;
      let changed = false;
      const assets = logo.assets.map((a) => {
        // A variant that looks like a URL (absolute or root-relative) with
        // an empty url field is the fingerprint of a paste into the wrong
        // input — heal it.
        if (/^(https?:\/\/|\/)/i.test(a.variant) && !a.url) {
          changed = true;
          return { ...a, variant: 'primary', url: a.variant };
        }
        return a;
      });
      if (changed) {
        await store.putArtifact(brandId, { ...logo, assets });
        applied.push(
          `${brandId}/logo/${logo.id}: moved URL from variant → url`,
        );
      }
    }
  } catch (err) {
    errors.push(
      `logo variant/url swap: ${err instanceof Error ? err.message : 'failed'}`,
    );
  }

  // ───────────────────────────────────────────────────────────────────
  // Migration: brand-yaml-merge-2026-09 — fill null brand-row fields
  // (mission, vision, urls, contact, founded, hq, primaryUrl,
  // primaryVoiceId) from the filesystem brand.yaml when the DB row
  // was inserted before those fields existed. Only touches fields
  // whose DB value is null/empty — preserves anything a user has
  // filled in through the admin. Idempotent.
  //
  // Why this exists: add-only seed-sync checks brand-row existence
  // and skips the whole put if the brand already exists. Fields
  // added to brand.yaml AFTER the row was first created never land.
  // ───────────────────────────────────────────────────────────────────
  try {
    const seed = await readSeedBrand(brandId);
    if (seed) {
      const current = await store.getBrand(brandId);
      const merged = { ...current };
      const patched: string[] = [];

      const mergeField = <K extends keyof typeof current>(key: K) => {
        const cur = current[key];
        const isEmpty =
          cur === undefined ||
          cur === null ||
          (typeof cur === 'string' && cur.trim() === '') ||
          (Array.isArray(cur) && cur.length === 0) ||
          (typeof cur === 'object' &&
            !Array.isArray(cur) &&
            cur !== null &&
            Object.keys(cur as object).length === 0);
        if (isEmpty && seed[key] !== undefined) {
          (merged as Record<string, unknown>)[key as string] = seed[key];
          patched.push(String(key));
        }
      };

      mergeField('mission');
      mergeField('vision');
      mergeField('primaryUrl');
      mergeField('urls');
      mergeField('contact');
      mergeField('founded');
      mergeField('hq');
      mergeField('primaryVoiceId');
      mergeField('tags');

      if (patched.length > 0) {
        await store.putBrand(merged);
        applied.push(`${brandId}: brand.yaml merge — ${patched.join(', ')}`);
      }
    }
  } catch (err) {
    errors.push(
      `brand.yaml merge: ${err instanceof Error ? err.message : 'failed'}`,
    );
  }

  // ───────────────────────────────────────────────────────────────────
  // Migration: empty-logo-primary-cleanup-2026-09 — delete a
  // `logo/primary` shell artifact that carries zero assets when
  // another logo for the same brand DOES have assets. The empty
  // shell can win pickPrimary and hide the real logo on the share
  // page. Only fires when there is a non-empty alternative — never
  // deletes the brand's only logo, however empty.
  // ───────────────────────────────────────────────────────────────────
  try {
    const logos = (
      await store.listArtifacts(brandId, { facetId: 'logo' })
    ).filter((l) => l.type === 'logo');
    const empty = logos.find((l) => l.id === 'primary' && l.assets.length === 0);
    const hasAlternative = logos.some(
      (l) => l.id !== 'primary' && l.assets.length > 0,
    );
    if (empty && hasAlternative) {
      await store.deleteArtifact(brandId, 'logo', 'primary');
      applied.push(`${brandId}/logo/primary: removed empty shell`);
    }
  } catch (err) {
    errors.push(
      `empty logo/primary cleanup: ${err instanceof Error ? err.message : 'failed'}`,
    );
  }

  // ───────────────────────────────────────────────────────────────────
  // Migration: scarlet-template-asset-notes-2026-09 — push the
  // asset-delivery output-contract rules (rules 7 and 8: absolute
  // URLs, and the closing "preview may not load images" line) into
  // scarlet's blog-post and certification-page template rows. The
  // rules live in the seed template body; add-only sync skipped
  // these rows on first pass so the body has to be re-pushed here.
  // Content-gated: only fires when the seed body carries the marker
  // and the DB body does not.
  // ───────────────────────────────────────────────────────────────────
  if (brandId === 'scarlet') {
    for (const templateId of ['blog-post', 'certification-page']) {
      const ASSET_NOTE_MARKER = 'Announce the preview limit';
      try {
        const seed = await readSeedTemplate(brandId, templateId);
        if (!seed || seed.type !== 'template') continue;
        if (!(seed.body ?? '').includes(ASSET_NOTE_MARKER)) continue;

        const db = await store
          .getArtifact(brandId, 'template', templateId)
          .catch(() => null);
        if (!db || db.type !== 'template') continue;
        if ((db.body ?? '').includes(ASSET_NOTE_MARKER)) continue;

        await store.putArtifact(brandId, {
          ...db,
          body: seed.body,
          scaffold: seed.scaffold,
          sections: seed.sections,
          format: seed.format,
          renderAs: seed.renderAs,
        });
        applied.push(
          `${brandId}/template/${templateId}: synced asset-delivery rules from seed`,
        );
      } catch (err) {
        errors.push(
          `${brandId}/template/${templateId} asset-note: ${err instanceof Error ? err.message : 'failed'}`,
        );
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // Migration: template-scaffold-2026-05 — sync scaffold/sections/body
  // from filesystem seed when the DB row predates a known scaffold
  // update. Identified by a marker string present only in the new
  // version. Idempotent: if the marker is already in the DB scaffold,
  // we skip.
  //
  // Why content-based marker rather than a version field? Because the
  // template item's `version` field is user-editable and may already
  // be customized; we don't want to step on it.
  // ───────────────────────────────────────────────────────────────────
  const TEMPLATE_SCAFFOLD_MARKERS: Record<string, string> = {
    // Bumped marker each time the seed scaffold changes meaningfully so
    // the migration re-fires on the next cold start.
    'blog-post': 'header.bar img { height: 40px;',
    'pitch-deck': '.slide.cover img.logo { height: 60px;',
    'talk-deck': '.slide.cover img.logo { height: 60px;',
    // product-landing-page: was a structure-only template (no scaffold).
    // First scaffold version uses the same .reveal-up motion class as
    // blog-post — that string in the seed scaffold is the upgrade marker.
    'product-landing-page': '.reveal-up',
    // email-blast: versioned scaffold comment as marker. Bump the date
    // in the comment + here whenever the seed scaffold changes.
    'email-blast': 'email-blast scaffold rev: 2026-05-11-force-rerun',
  };

  for (const [templateId, marker] of Object.entries(
    TEMPLATE_SCAFFOLD_MARKERS,
  )) {
    let dbItem;
    try {
      dbItem = await store.getArtifact(brandId, 'template', templateId);
    } catch (err) {
      if (err instanceof Error && /not found/i.test(err.message)) {
        // Template not in DB at all — seed-sync would have added it on
        // add-only mode if the file existed. Skip silently.
        continue;
      }
      errors.push(
        `template/${templateId}: read failed: ${
          err instanceof Error ? err.message : 'unknown'
        }`,
      );
      continue;
    }

    if (dbItem.type !== 'template') {
      errors.push(`template/${templateId}: DB item has wrong type`);
      continue;
    }

    const dbScaffold = dbItem.scaffold ?? '';
    if (dbScaffold.includes(marker)) {
      // Already up to date — silent skip.
      continue;
    }

    const seed = await readSeedTemplate(brandId, templateId);
    if (!seed) {
      errors.push(
        `template/${templateId}: seed file not reachable (check next.config outputFileTracingIncludes — brands/ may not be in this function's bundle)`,
      );
      continue;
    }
    if (seed.type !== 'template') {
      errors.push(
        `template/${templateId}: seed parsed as non-template (type=${seed.type})`,
      );
      continue;
    }
    if (!seed.scaffold) {
      errors.push(`template/${templateId}: seed has no scaffold field`);
      continue;
    }
    if (!seed.scaffold.includes(marker)) {
      errors.push(
        `template/${templateId}: marker not in seed scaffold (was the marker bumped without updating the seed?)`,
      );
      continue;
    }

    // Patch the structural fields (scaffold, sections, body, format,
    // renderAs) but PRESERVE every base field the user may have
    // customised — id, name, description, tags, version, updatedAt.
    try {
      await store.putArtifact(brandId, {
        ...dbItem,
        scaffold: seed.scaffold,
        sections: seed.sections,
        body: seed.body,
        format: seed.format,
        renderAs: seed.renderAs,
      });
      applied.push(
        `${brandId}/template/${templateId}: synced scaffold/sections/body from seed`,
      );
    } catch (err) {
      errors.push(
        `template/${templateId}: putArtifact failed: ${
          err instanceof Error ? err.message : 'unknown'
        }`,
      );
    }
  }

  return { applied, errors };
}

/**
 * Read a brand.yaml seed from the filesystem and parse it. Returns
 * null if the brands/ root can't be found, the file doesn't exist, or
 * parsing fails — never throws. Used by the brand-yaml-merge migration
 * to backfill nulls in the DB brand row from the seed.
 */
async function readSeedBrand(
  brandId: string,
): Promise<ReturnType<typeof Brand.parse> | null> {
  const dir = await findBrandsDir();
  if (!dir) return null;
  const filePath = path.join(dir, brandId, 'brand.yaml');
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const yaml = parseYaml(raw) as Record<string, unknown>;
    return Brand.parse({ id: brandId, ...yaml });
  } catch {
    return null;
  }
}

/**
 * Read a template seed file from the filesystem and parse it. Returns
 * null if the brands/ root can't be found, the file doesn't exist, or
 * parsing fails — never throws.
 */
async function readSeedTemplate(
  brandId: string,
  templateId: string,
): Promise<ReturnType<typeof parseArtifact> | null> {
  const dir = await findBrandsDir();
  if (!dir) return null;
  const filePath = path.join(dir, brandId, 'templates', `${templateId}.md`);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return parseArtifact(raw, 'template', templateId);
  } catch {
    return null;
  }
}
