'use client';

import { useId, useState } from 'react';
import { stringify as stringifyYaml } from 'yaml';
import type { Typeface } from '@jasper-brain/core';
import type { UploadedAsset } from '@/lib/blob';

const PROVIDERS = [
  { value: '', label: '— pick provider —' },
  { value: 'google-fonts', label: 'Google Fonts' },
  { value: 'adobe-fonts', label: 'Adobe Fonts (Typekit)' },
  { value: 'self-hosted', label: 'Self-hosted (Vercel Blob)' },
  { value: 'system', label: 'System fonts only' },
] as const;

const FONT_FORMATS = ['woff2', 'woff', 'ttf', 'otf'] as const;

interface DraftFile {
  weight: string;
  style: 'normal' | 'italic';
  url: string;
  format: string;
}

interface DraftTypeface {
  family: string;
  role: string;
  stack: string;
  weights: string;
  provider: string;
  sourceUrl: string;
  cssImport: string;
  files: DraftFile[];
  use: string;
}

const DEFAULT_FILE: DraftFile = {
  weight: '400',
  style: 'normal',
  url: '',
  format: 'woff2',
};

const DEFAULT_TYPEFACE: DraftTypeface = {
  family: '',
  role: 'primary',
  stack: '',
  weights: '',
  provider: '',
  sourceUrl: '',
  cssImport: '',
  files: [],
  use: '',
};

function toDraft(tf: Typeface): DraftTypeface {
  return {
    family: tf.family,
    role: tf.role,
    stack: tf.stack ?? '',
    weights: tf.weights.join(', '),
    provider: tf.source?.provider ?? '',
    sourceUrl: tf.source?.url ?? '',
    cssImport: tf.source?.cssImport ?? '',
    files:
      tf.source?.files?.map((f) => ({
        weight: String(f.weight),
        style: f.style,
        url: f.url,
        format: f.format ?? '',
      })) ?? [],
    use: tf.use ?? '',
  };
}

function serialize(drafts: DraftTypeface[]): string {
  const typefaces = drafts.map((d) => {
    const out: Record<string, unknown> = {
      family: d.family,
      role: d.role,
    };
    if (d.stack) out.stack = d.stack;

    const weights = d.weights
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
    if (weights.length > 0) out.weights = weights;

    const source: Record<string, unknown> = {};
    if (d.provider) source.provider = d.provider;
    if (d.sourceUrl) source.url = d.sourceUrl;
    if (d.cssImport) source.cssImport = d.cssImport;
    if (d.provider === 'self-hosted' && d.files.length > 0) {
      source.files = d.files
        .filter((f) => f.url)
        .map((f) => {
          const fileObj: Record<string, unknown> = {
            weight: parseInt(f.weight, 10) || 400,
            style: f.style,
            url: f.url,
          };
          if (f.format) fileObj.format = f.format;
          return fileObj;
        });
    }
    if (Object.keys(source).length > 0) out.source = source;

    if (d.use) out.use = d.use;
    return out;
  });
  if (typefaces.length === 0) return '[]';
  return stringifyYaml(typefaces).trimEnd();
}

const inputBase =
  'rounded border border-stone-300 bg-white px-2.5 py-1.5 text-sm focus:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-700';

export function TypefacesEditor({
  defaultValue,
  uploadedAssets,
}: {
  defaultValue?: Typeface[];
  uploadedAssets: UploadedAsset[];
}) {
  const [drafts, setDrafts] = useState<DraftTypeface[]>(
    defaultValue && defaultValue.length > 0
      ? defaultValue.map(toDraft)
      : [{ ...DEFAULT_TYPEFACE }],
  );
  const datalistId = useId();

  const update = (idx: number, patch: Partial<DraftTypeface>) => {
    setDrafts((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
    );
  };
  const remove = (idx: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== idx));
  };
  const add = () => {
    setDrafts((prev) => [...prev, { ...DEFAULT_TYPEFACE }]);
  };

  const updateFile = (
    typefaceIdx: number,
    fileIdx: number,
    patch: Partial<DraftFile>,
  ) => {
    setDrafts((prev) =>
      prev.map((d, i) =>
        i === typefaceIdx
          ? {
              ...d,
              files: d.files.map((f, j) =>
                j === fileIdx ? { ...f, ...patch } : f,
              ),
            }
          : d,
      ),
    );
  };
  const addFile = (typefaceIdx: number) => {
    setDrafts((prev) =>
      prev.map((d, i) =>
        i === typefaceIdx ? { ...d, files: [...d.files, { ...DEFAULT_FILE }] } : d,
      ),
    );
  };
  const removeFile = (typefaceIdx: number, fileIdx: number) => {
    setDrafts((prev) =>
      prev.map((d, i) =>
        i === typefaceIdx
          ? { ...d, files: d.files.filter((_, j) => j !== fileIdx) }
          : d,
      ),
    );
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-medium text-stone-800">Typefaces</div>
        <p className="text-xs text-stone-500 mt-0.5">
          One card per typeface. Self-hosted fonts get a per-weight file picker.
        </p>
      </div>

      <ul className="space-y-4">
        {drafts.map((draft, idx) => (
          <li
            key={idx}
            className="rounded-lg border border-stone-200 bg-white p-4 space-y-3"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-xs uppercase tracking-wide text-stone-500 font-semibold">
                Typeface {idx + 1}
              </div>
              <button
                type="button"
                onClick={() => remove(idx)}
                disabled={drafts.length === 1}
                className="text-xs text-red-700 hover:text-red-900 disabled:opacity-30"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={draft.family}
                onChange={(e) => update(idx, { family: e.target.value })}
                placeholder='family — e.g. "Inter"'
                className={inputBase}
                aria-label="Family"
              />
              <input
                type="text"
                value={draft.role}
                onChange={(e) => update(idx, { role: e.target.value })}
                placeholder='role — e.g. "primary", "display", "mono"'
                className={inputBase}
                aria-label="Role"
              />
            </div>

            <input
              type="text"
              value={draft.stack}
              onChange={(e) => update(idx, { stack: e.target.value })}
              placeholder='CSS stack — e.g. "Inter, ui-sans-serif, system-ui, sans-serif"'
              className={`${inputBase} w-full font-mono text-xs`}
              aria-label="CSS stack"
            />

            <input
              type="text"
              value={draft.weights}
              onChange={(e) => update(idx, { weights: e.target.value })}
              placeholder="weights (comma-separated) — e.g. 400, 500, 600, 700"
              className={`${inputBase} w-full`}
              aria-label="Weights"
            />

            <div className="space-y-2 border-t border-stone-100 pt-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Source
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={draft.provider}
                  onChange={(e) =>
                    update(idx, { provider: e.target.value })
                  }
                  className={inputBase}
                  aria-label="Provider"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={draft.sourceUrl}
                  onChange={(e) =>
                    update(idx, { sourceUrl: e.target.value })
                  }
                  placeholder="reference URL (Google Fonts page, Typekit, …)"
                  className={inputBase}
                  aria-label="Source URL"
                />
              </div>

              <textarea
                value={draft.cssImport}
                onChange={(e) => update(idx, { cssImport: e.target.value })}
                rows={3}
                placeholder={
                  draft.provider === 'self-hosted'
                    ? 'CSS — your @font-face declarations (auto-suggest based on files below later)'
                    : draft.provider === 'adobe-fonts'
                      ? 'CSS — your Typekit <link rel=stylesheet> tag'
                      : draft.provider === 'google-fonts'
                        ? "CSS — @import url('https://fonts.googleapis.com/css2?…');"
                        : 'CSS — anything to drop into a stylesheet'
                }
                className={`${inputBase} w-full font-mono text-xs leading-relaxed`}
                aria-label="CSS import"
              />

              {draft.provider === 'self-hosted' && (
                <div className="space-y-2 border-t border-stone-100 pt-3">
                  <div className="flex items-baseline justify-between">
                    <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Font files
                    </div>
                    <span className="text-[10px] text-stone-400">
                      one row per weight × style
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {draft.files.map((file, fIdx) => (
                      <li
                        key={fIdx}
                        className="grid grid-cols-[5rem_6rem_1fr_5rem_auto] gap-2"
                      >
                        <input
                          type="text"
                          value={file.weight}
                          onChange={(e) =>
                            updateFile(idx, fIdx, { weight: e.target.value })
                          }
                          placeholder="weight"
                          className={inputBase}
                          aria-label="Font weight"
                        />
                        <select
                          value={file.style}
                          onChange={(e) =>
                            updateFile(idx, fIdx, {
                              style: e.target.value as 'normal' | 'italic',
                            })
                          }
                          className={inputBase}
                          aria-label="Style"
                        >
                          <option value="normal">normal</option>
                          <option value="italic">italic</option>
                        </select>
                        <input
                          type="text"
                          value={file.url}
                          onChange={(e) =>
                            updateFile(idx, fIdx, { url: e.target.value })
                          }
                          list={datalistId}
                          placeholder="font file URL — pick from uploads"
                          className={`${inputBase} font-mono text-xs`}
                          aria-label="Font file URL"
                        />
                        <select
                          value={file.format}
                          onChange={(e) =>
                            updateFile(idx, fIdx, { format: e.target.value })
                          }
                          className={inputBase}
                          aria-label="File format"
                        >
                          <option value="">—</option>
                          {FONT_FORMATS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeFile(idx, fIdx)}
                          className="text-xs text-red-700 hover:text-red-900 px-1"
                          aria-label="Remove file"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => addFile(idx)}
                    className="text-xs text-stone-700 hover:text-stone-900 font-medium"
                  >
                    + Add file
                  </button>
                </div>
              )}
            </div>

            <textarea
              value={draft.use}
              onChange={(e) => update(idx, { use: e.target.value })}
              rows={2}
              placeholder='When to use — e.g. "Body, UI, marketing copy."'
              className={`${inputBase} w-full`}
              aria-label="Usage note"
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={add}
        className="text-sm text-stone-700 hover:text-stone-900 font-medium"
      >
        + Add another typeface
      </button>

      <datalist id={datalistId}>
        {uploadedAssets.map((asset) => {
          const fileName = asset.pathname.split('/').pop() ?? asset.pathname;
          const fullUrl =
            asset.url.startsWith('http') || typeof window === 'undefined'
              ? asset.url
              : `${window.location.origin}${asset.url}`;
          return (
            <option key={asset.pathname} value={fullUrl}>
              {fileName}
            </option>
          );
        })}
      </datalist>

      <input type="hidden" name="typefaces" value={serialize(drafts)} />
    </div>
  );
}
