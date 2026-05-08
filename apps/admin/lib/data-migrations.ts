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
import { parseArtifact, type WritableBrainStore } from '@jasper-brain/core';
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
    'pitch-deck': 'padding-top: clamp(96px, 12vw, 168px)',
    'talk-deck': 'padding-top: clamp(96px, 12vw, 168px)',
  };

  for (const [templateId, marker] of Object.entries(
    TEMPLATE_SCAFFOLD_MARKERS,
  )) {
    try {
      const dbItem = await store.getArtifact(brandId, 'template', templateId);
      if (dbItem.type !== 'template') continue;
      const dbScaffold = dbItem.scaffold ?? '';
      if (dbScaffold.includes(marker)) continue; // already up to date

      const seed = await readSeedTemplate(brandId, templateId);
      if (!seed || seed.type !== 'template' || !seed.scaffold) continue;
      if (!seed.scaffold.includes(marker)) continue; // seed not yet updated

      // Patch the structural fields (scaffold, sections, body, format,
      // renderAs) but PRESERVE every base field the user may have
      // customised — id, name, description, tags, version, updatedAt.
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
      // Template not in DB at all — that's fine; the seed-sync would have
      // added it on add-only mode. Skip silently.
      if (
        err instanceof Error &&
        /not found/i.test(err.message)
      ) {
        continue;
      }
      errors.push(
        `template/${templateId}: ${
          err instanceof Error ? err.message : 'failed'
        }`,
      );
    }
  }

  return { applied, errors };
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
