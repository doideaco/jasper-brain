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
import type { WritableBrainStore } from '@jasper-brain/core';

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

  return { applied, errors };
}
