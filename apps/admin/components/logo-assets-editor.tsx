'use client';

import { useState } from 'react';
import { stringify as stringifyYaml } from 'yaml';
import type { LogoAsset } from '@jasper-brain/core';
import type { UploadedAsset } from '@/lib/blob';
import { AssetField } from './asset-field';

interface DraftAsset {
  variant: string;
  format: 'svg' | 'png' | 'pdf' | 'eps' | 'ai';
  url: string;
  use: string;
  background: 'light' | 'dark' | 'either' | '';
}

const DEFAULT_DRAFT: DraftAsset = {
  variant: '',
  format: 'svg',
  url: '',
  use: '',
  background: 'either',
};

function toDraft(asset: LogoAsset): DraftAsset {
  return {
    variant: asset.variant,
    format: asset.format,
    url: asset.url,
    use: asset.use ?? '',
    background: asset.background ?? '',
  };
}

function serialize(drafts: DraftAsset[]): string {
  if (drafts.length === 0) return '[]';
  const cleaned = drafts.map((d) => {
    const obj: Record<string, unknown> = {
      variant: d.variant,
      format: d.format,
      url: d.url,
    };
    if (d.use) obj.use = d.use;
    if (d.background) obj.background = d.background;
    return obj;
  });
  return stringifyYaml(cleaned).trimEnd();
}

const inputBase =
  'rounded border border-stone-300 bg-white px-2.5 py-1.5 text-sm focus:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-700';

export function LogoAssetsEditor({
  defaultValue,
  uploadedAssets,
}: {
  defaultValue?: LogoAsset[];
  uploadedAssets: UploadedAsset[];
}) {
  const [drafts, setDrafts] = useState<DraftAsset[]>(
    defaultValue && defaultValue.length > 0
      ? defaultValue.map(toDraft)
      : [{ ...DEFAULT_DRAFT }],
  );

  const update = (idx: number, patch: Partial<DraftAsset>) => {
    setDrafts((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
    );
  };
  const remove = (idx: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== idx));
  };
  const add = () => {
    setDrafts((prev) => [...prev, { ...DEFAULT_DRAFT }]);
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-medium text-stone-800">Assets</div>
        <p className="text-xs text-stone-500 mt-0.5">
          One row per logo variant. Pick a URL from your uploaded assets, or
          paste an external URL.
        </p>
      </div>

      <ul className="space-y-3">
        {drafts.map((draft, idx) => (
          <li
            key={idx}
            className="rounded-lg border border-stone-200 bg-white p-3 space-y-2"
          >
            <div className="grid grid-cols-[1fr_6rem_auto] gap-2">
              <input
                type="text"
                value={draft.variant}
                onChange={(e) => update(idx, { variant: e.target.value })}
                placeholder="variant — e.g. wordmark-on-light"
                className={inputBase}
                aria-label="Variant name"
              />
              <select
                value={draft.format}
                onChange={(e) =>
                  update(idx, { format: e.target.value as DraftAsset['format'] })
                }
                className={inputBase}
                aria-label="File format"
              >
                <option value="svg">SVG</option>
                <option value="png">PNG</option>
                <option value="pdf">PDF</option>
                <option value="eps">EPS</option>
                <option value="ai">AI</option>
              </select>
              <button
                type="button"
                onClick={() => remove(idx)}
                disabled={drafts.length === 1}
                className="text-xs text-red-700 hover:text-red-900 disabled:opacity-30 px-2"
                aria-label="Remove asset"
              >
                Remove
              </button>
            </div>

            <AssetField
              value={draft.url}
              onChange={(next) => update(idx, { url: next })}
              assets={uploadedAssets}
              accept="image"
              placeholder="URL — paste, or click Browse"
            />

            <div className="grid grid-cols-[1fr_8rem] gap-2">
              <input
                type="text"
                value={draft.use}
                onChange={(e) => update(idx, { use: e.target.value })}
                placeholder="When to use (optional)"
                className={inputBase}
                aria-label="Usage note"
              />
              <select
                value={draft.background}
                onChange={(e) =>
                  update(idx, {
                    background: e.target.value as DraftAsset['background'],
                  })
                }
                className={inputBase}
                aria-label="Intended background"
              >
                <option value="">no preference</option>
                <option value="light">light bg</option>
                <option value="dark">dark bg</option>
                <option value="either">either</option>
              </select>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={add}
        className="text-sm text-stone-700 hover:text-stone-900 font-medium"
      >
        + Add another asset
      </button>

      <input type="hidden" name="assets" value={serialize(drafts)} />
    </div>
  );
}
