'use client';

import { useEffect, useRef, useState } from 'react';
import { stringify as stringifyYaml } from 'yaml';
import type { Typeface, TypefaceFile } from '@jasper-brain/core';
import type { UploadedAsset } from '@/lib/blob';
import {
  generateFontFace,
  parseFontFilename,
  suggestStack,
} from '@/lib/font-utils';
import { AssetField } from './asset-field';

const PROVIDERS = [
  {
    value: 'self-hosted',
    label: 'Self-hosted',
    blurb: 'Upload .woff2/.woff/.ttf/.otf to Vercel Blob',
  },
  {
    value: 'google-fonts',
    label: 'Google Fonts',
    blurb: 'Free, hosted by Google — paste an @import URL',
  },
  {
    value: 'adobe-fonts',
    label: 'Adobe Fonts',
    blurb: 'Typekit subscription — paste a <link> tag',
  },
  {
    value: 'system',
    label: 'System fonts',
    blurb: 'No download — relies on the OS',
  },
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
  stackAuto: boolean;
  weights: string;
  weightsAuto: boolean;
  provider: string;
  sourceUrl: string;
  cssImport: string;
  cssImportAuto: boolean;
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
  stackAuto: true,
  weights: '',
  weightsAuto: true,
  provider: '',
  sourceUrl: '',
  cssImport: '',
  cssImportAuto: true,
  files: [],
  use: '',
};

function fileForCss(f: DraftFile) {
  return {
    url: f.url,
    weight: parseInt(f.weight, 10) || 400,
    style: f.style,
    format: f.format,
  };
}

function effectiveStack(d: DraftTypeface): string {
  if (d.stackAuto) return suggestStack(d.family, d.role);
  return d.stack;
}

function effectiveCss(d: DraftTypeface): string {
  if (!d.cssImportAuto) return d.cssImport;
  if (d.provider === 'self-hosted') {
    return generateFontFace(d.family, d.files.map(fileForCss));
  }
  return '';
}

function effectiveWeights(d: DraftTypeface): number[] {
  if (d.weightsAuto && d.provider === 'self-hosted') {
    const set = new Set<number>();
    for (const f of d.files) {
      if (!f.url) continue;
      const w = parseInt(f.weight, 10);
      if (!Number.isNaN(w)) set.add(w);
    }
    return Array.from(set).sort((a, b) => a - b);
  }
  return d.weights
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
}

function toDraft(tf: Typeface): DraftTypeface {
  const files =
    tf.source?.files?.map((f) => ({
      weight: String(f.weight),
      style: f.style,
      url: f.url,
      format: f.format ?? '',
    })) ?? [];
  const storedStack = tf.stack ?? '';
  const storedCss = tf.source?.cssImport ?? '';
  const generatedStack = suggestStack(tf.family, tf.role);
  const generatedCss = generateFontFace(tf.family, files.map(fileForCss));
  const storedWeights = tf.weights.join(', ');
  const autoWeights =
    tf.source?.provider === 'self-hosted'
      ? Array.from(
          new Set(
            files.filter((f) => f.url).map((f) => parseInt(f.weight, 10)),
          ),
        )
          .sort((a, b) => a - b)
          .join(', ')
      : '';
  return {
    family: tf.family,
    role: tf.role,
    stack: storedStack,
    stackAuto: !storedStack || storedStack === generatedStack,
    weights: storedWeights,
    weightsAuto:
      tf.source?.provider === 'self-hosted' &&
      (!storedWeights || storedWeights === autoWeights),
    provider: tf.source?.provider ?? '',
    sourceUrl: tf.source?.url ?? '',
    cssImport: storedCss,
    cssImportAuto:
      tf.source?.provider === 'self-hosted'
        ? !storedCss || storedCss === generatedCss
        : !storedCss,
    files,
    use: tf.use ?? '',
  };
}

/** Convert a draft typeface to the canonical Typeface shape. */
export function draftToTypeface(d: DraftTypeface): Typeface {
  const tf: Typeface = {
    family: d.family,
    role: d.role,
    weights: effectiveWeights(d),
  };
  const stack = effectiveStack(d);
  if (stack) tf.stack = stack;
  const sourceFiles: TypefaceFile[] =
    d.provider === 'self-hosted' && d.files.length > 0
      ? d.files
          .filter((f) => f.url)
          .map((f) => {
            const out: TypefaceFile = {
              weight: parseInt(f.weight, 10) || 400,
              style: f.style,
              url: f.url,
            };
            if (f.format) out.format = f.format as TypefaceFile['format'];
            return out;
          })
      : [];
  const source: NonNullable<Typeface['source']> = { files: sourceFiles };
  if (d.provider) {
    source.provider = d.provider as NonNullable<Typeface['source']>['provider'];
  }
  if (d.sourceUrl) source.url = d.sourceUrl;
  const css = effectiveCss(d);
  if (css) source.cssImport = css;
  // Only attach the source if it has anything beyond an empty files array
  const hasSourceContent =
    !!source.provider ||
    !!source.url ||
    !!source.cssImport ||
    source.files.length > 0;
  if (hasSourceContent) tf.source = source;
  if (d.use) tf.use = d.use;
  return tf;
}

export function typefacesToYaml(typefaces: Typeface[]): string {
  if (typefaces.length === 0) return '[]';
  // Strip undefined keys for cleaner YAML
  const cleaned = typefaces.map((tf) => {
    const out: Record<string, unknown> = {
      family: tf.family,
      role: tf.role,
    };
    if (tf.stack) out.stack = tf.stack;
    if (tf.weights.length > 0) out.weights = tf.weights;
    if (tf.source && Object.keys(tf.source).length > 0) out.source = tf.source;
    if (tf.use) out.use = tf.use;
    return out;
  });
  return stringifyYaml(cleaned).trimEnd();
}

const inputBase =
  'rounded border border-stone-300 bg-white px-2.5 py-1.5 text-sm focus:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-700';

export function TypefacesEditor({
  defaultValue,
  uploadedAssets,
  onChange,
}: {
  defaultValue?: Typeface[];
  uploadedAssets: UploadedAsset[];
  onChange?: (typefaces: Typeface[]) => void;
}) {
  const [drafts, setDrafts] = useState<DraftTypeface[]>(
    defaultValue && defaultValue.length > 0
      ? defaultValue.map(toDraft)
      : [{ ...DEFAULT_TYPEFACE }],
  );

  // Notify parent of typefaces whenever drafts change.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
    onChange?.(drafts.map(draftToTypeface));
    // onChange intentionally omitted from deps — we only want to fire on
    // draft changes, not when the parent re-renders with a new callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drafts]);

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

  const setProvider = (idx: number, provider: string) => {
    setDrafts((prev) =>
      prev.map((d, i) => {
        if (i !== idx) return d;
        const next = { ...d, provider };
        // When picking self-hosted, drop in an empty file row so the
        // picker is one click away.
        if (provider === 'self-hosted' && d.files.length === 0) {
          next.files = [{ ...DEFAULT_FILE }];
        }
        return next;
      }),
    );
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

  /**
   * Picking a file URL parses the filename and overwrites that row's
   * weight/style/format. It also fills the typeface family if empty.
   */
  const handleFileUrlChange = (
    typefaceIdx: number,
    fileIdx: number,
    url: string,
  ) => {
    const filename = url.split('/').pop() ?? '';
    const parsed = parseFontFilename(filename);
    setDrafts((prev) =>
      prev.map((d, i) => {
        if (i !== typefaceIdx) return d;
        const old = d.files[fileIdx];
        const newFile: DraftFile = {
          weight:
            parsed.weight !== undefined ? String(parsed.weight) : old.weight,
          style: parsed.style ?? old.style,
          format: parsed.format ?? old.format,
          url,
        };
        const family = d.family || parsed.family || '';
        return {
          ...d,
          family,
          files: d.files.map((f, j) => (j === fileIdx ? newFile : f)),
        };
      }),
    );
  };

  const addFile = (typefaceIdx: number) => {
    setDrafts((prev) =>
      prev.map((d, i) =>
        i === typefaceIdx
          ? { ...d, files: [...d.files, { ...DEFAULT_FILE }] }
          : d,
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
          Pick a source first; everything else falls into place.
        </p>
      </div>

      <ul className="space-y-5">
        {drafts.map((draft, idx) => (
          <TypefaceCard
            key={idx}
            draft={draft}
            idx={idx}
            removable={drafts.length > 1}
            uploadedAssets={uploadedAssets}
            onUpdate={(patch) => update(idx, patch)}
            onRemove={() => remove(idx)}
            onSetProvider={(p) => setProvider(idx, p)}
            onFileUrlChange={(fIdx, url) =>
              handleFileUrlChange(idx, fIdx, url)
            }
            onFileUpdate={(fIdx, patch) => updateFile(idx, fIdx, patch)}
            onFileAdd={() => addFile(idx)}
            onFileRemove={(fIdx) => removeFile(idx, fIdx)}
          />
        ))}
      </ul>

      <button
        type="button"
        onClick={add}
        className="text-sm text-stone-700 hover:text-stone-900 font-medium"
      >
        + Add another typeface
      </button>

    </div>
  );
}

interface CardProps {
  draft: DraftTypeface;
  idx: number;
  removable: boolean;
  uploadedAssets: UploadedAsset[];
  onUpdate: (patch: Partial<DraftTypeface>) => void;
  onRemove: () => void;
  onSetProvider: (p: string) => void;
  onFileUrlChange: (fIdx: number, url: string) => void;
  onFileUpdate: (fIdx: number, patch: Partial<DraftFile>) => void;
  onFileAdd: () => void;
  onFileRemove: (fIdx: number) => void;
}

function TypefaceCard({
  draft,
  idx,
  removable,
  uploadedAssets,
  onUpdate,
  onRemove,
  onSetProvider,
  onFileUrlChange,
  onFileUpdate,
  onFileAdd,
  onFileRemove,
}: CardProps) {
  const hasSource = !!draft.provider;
  const hasContent =
    draft.provider === 'self-hosted'
      ? draft.files.some((f) => !!f.url)
      : draft.provider === 'system'
        ? !!draft.family
        : !!draft.cssImport;
  const showIdentity = hasContent || !!draft.family;
  const showOutput = !!draft.family;
  const previewWeights = effectiveWeights(draft);
  const previewCss = previewCssFor(draft);

  return (
    <li className="rounded-lg border border-stone-200 bg-white p-4 space-y-5">
      {/* Header */}
      <header className="flex items-baseline justify-between gap-3">
        <div className="text-xs uppercase tracking-wide text-stone-500 font-semibold">
          Typeface {idx + 1}
          {draft.family && (
            <span className="ml-2 text-stone-700 font-normal lowercase tracking-normal">
              — {draft.family}
              {draft.role && (
                <span className="text-stone-400">, {draft.role}</span>
              )}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={!removable}
          className="text-xs text-red-700 hover:text-red-900 disabled:opacity-30"
        >
          Remove
        </button>
      </header>

      {/* Step 1: Source */}
      <Section step="1" title="Source">
        <div className="grid grid-cols-2 gap-2">
          {PROVIDERS.map((p) => {
            const active = draft.provider === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => onSetProvider(p.value)}
                className={`text-left rounded-lg border p-3 transition-colors ${
                  active
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-300 bg-white hover:border-stone-500'
                }`}
              >
                <div className="font-medium text-sm">{p.label}</div>
                <div
                  className={`text-xs mt-0.5 ${
                    active ? 'text-stone-300' : 'text-stone-500'
                  }`}
                >
                  {p.blurb}
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Step 2: source-specific content */}
      {hasSource && draft.provider === 'self-hosted' && (
        <Section step="2" title="Font files">
          <FilesEditor
            files={draft.files}
            uploadedAssets={uploadedAssets}
            onFileUrlChange={onFileUrlChange}
            onFileUpdate={onFileUpdate}
            onFileAdd={onFileAdd}
            onFileRemove={onFileRemove}
          />
        </Section>
      )}

      {hasSource && draft.provider === 'google-fonts' && (
        <Section step="2" title="Paste your @import">
          <textarea
            value={draft.cssImport}
            onChange={(e) => onUpdate({ cssImport: e.target.value })}
            rows={3}
            placeholder="@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');"
            className={`${inputBase} w-full font-mono text-xs leading-relaxed`}
          />
          <p className="text-xs text-stone-500">
            From{' '}
            <a
              href="https://fonts.google.com"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-stone-900"
            >
              fonts.google.com
            </a>{' '}
            → pick a family → "Get embed code" → @import.
          </p>
        </Section>
      )}

      {hasSource && draft.provider === 'adobe-fonts' && (
        <Section step="2" title="Paste your Typekit link">
          <textarea
            value={draft.cssImport}
            onChange={(e) => onUpdate({ cssImport: e.target.value })}
            rows={2}
            placeholder='<link rel="stylesheet" href="https://use.typekit.net/xxxxxxx.css">'
            className={`${inputBase} w-full font-mono text-xs leading-relaxed`}
          />
          <p className="text-xs text-stone-500">
            From your Typekit project's web fonts page.
          </p>
        </Section>
      )}

      {hasSource && draft.provider === 'system' && (
        <Section step="2" title="System fonts">
          <p className="text-xs text-stone-500">
            No CSS to paste — system fonts ship with the OS. Just give it a
            family name below and a CSS stack.
          </p>
        </Section>
      )}

      {/* Step 3: Identity */}
      {showIdentity && (
        <Section step="3" title="Identity">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={draft.family}
              onChange={(e) => onUpdate({ family: e.target.value })}
              placeholder='family — e.g. "Inter"'
              className={inputBase}
              aria-label="Family"
            />
            <input
              type="text"
              value={draft.role}
              onChange={(e) => onUpdate({ role: e.target.value })}
              placeholder='role — e.g. "primary", "display", "mono"'
              className={inputBase}
              aria-label="Role"
            />
          </div>

          <WeightsField draft={draft} onUpdate={onUpdate} />
        </Section>
      )}

      {/* Step 4: Generated CSS */}
      {showOutput && (
        <Section step="4" title="Generated CSS">
          <StackField draft={draft} onUpdate={onUpdate} />
          {draft.provider !== 'system' && (
            <CssField draft={draft} onUpdate={onUpdate} />
          )}
        </Section>
      )}

      {/* Live preview */}
      {showOutput && (
        <Section title="Preview">
          <FontPreview
            family={draft.family}
            weights={
              previewWeights.length > 0 ? previewWeights : [400]
            }
            cssImport={previewCss}
          />
        </Section>
      )}

      {/* Use note */}
      {showIdentity && (
        <Section title="When to use">
          <textarea
            value={draft.use}
            onChange={(e) => onUpdate({ use: e.target.value })}
            rows={2}
            placeholder='e.g. "Body, UI, marketing copy."'
            className={`${inputBase} w-full`}
          />
        </Section>
      )}
    </li>
  );
}

function Section({
  step,
  title,
  children,
}: {
  step?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="text-xs uppercase tracking-wide text-stone-500 font-semibold flex items-baseline gap-2">
        {step && (
          <span className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono text-[10px]">
            {step}
          </span>
        )}
        <span>{title}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function FilesEditor({
  files,
  uploadedAssets,
  onFileUrlChange,
  onFileUpdate,
  onFileAdd,
  onFileRemove,
}: {
  files: DraftFile[];
  uploadedAssets: UploadedAsset[];
  onFileUrlChange: (fIdx: number, url: string) => void;
  onFileUpdate: (fIdx: number, patch: Partial<DraftFile>) => void;
  onFileAdd: () => void;
  onFileRemove: (fIdx: number) => void;
}) {
  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {files.map((file, fIdx) => (
          <li
            key={fIdx}
            className="rounded border border-stone-100 bg-stone-50/50 p-2 space-y-2"
          >
            <AssetField
              value={file.url}
              onChange={(next) => onFileUrlChange(fIdx, next)}
              assets={uploadedAssets}
              accept="font"
              placeholder="Pick or paste a font file URL"
            />
            <div className="grid grid-cols-[5rem_7rem_5rem_auto] gap-2">
              <input
                type="text"
                value={file.weight}
                onChange={(e) =>
                  onFileUpdate(fIdx, { weight: e.target.value })
                }
                placeholder="weight"
                className={inputBase}
                aria-label="Font weight"
              />
              <select
                value={file.style}
                onChange={(e) =>
                  onFileUpdate(fIdx, {
                    style: e.target.value as 'normal' | 'italic',
                  })
                }
                className={inputBase}
                aria-label="Style"
              >
                <option value="normal">normal</option>
                <option value="italic">italic</option>
              </select>
              <select
                value={file.format}
                onChange={(e) =>
                  onFileUpdate(fIdx, { format: e.target.value })
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
                onClick={() => onFileRemove(fIdx)}
                className="text-xs text-red-700 hover:text-red-900 px-1"
                aria-label="Remove file"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onFileAdd}
        className="text-xs text-stone-700 hover:text-stone-900 font-medium"
      >
        + Add file
      </button>
    </div>
  );
}

function WeightsField({
  draft,
  onUpdate,
}: {
  draft: DraftTypeface;
  onUpdate: (patch: Partial<DraftTypeface>) => void;
}) {
  const auto = draft.weightsAuto && draft.provider === 'self-hosted';
  const computed = effectiveWeights(draft).join(', ');
  const value = auto ? computed : draft.weights;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-stone-500">Weights</span>
        {draft.provider === 'self-hosted' && (
          <label className="text-[11px] text-stone-500 flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.weightsAuto}
              onChange={(e) =>
                onUpdate({
                  weightsAuto: e.target.checked,
                  weights: e.target.checked ? draft.weights : computed,
                })
              }
            />
            from files
          </label>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onUpdate({ weights: e.target.value })}
        readOnly={auto}
        placeholder="weights (comma-separated) — e.g. 400, 500, 600, 700"
        className={`${inputBase} w-full ${auto ? 'bg-stone-50 text-stone-600' : ''}`}
      />
    </div>
  );
}

function StackField({
  draft,
  onUpdate,
}: {
  draft: DraftTypeface;
  onUpdate: (patch: Partial<DraftTypeface>) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-stone-500">CSS stack</span>
        <label className="text-[11px] text-stone-500 flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={draft.stackAuto}
            onChange={(e) =>
              onUpdate({
                stackAuto: e.target.checked,
                stack: e.target.checked
                  ? draft.stack
                  : effectiveStack(draft) || draft.stack,
              })
            }
          />
          auto
        </label>
      </div>
      <input
        type="text"
        value={effectiveStack(draft)}
        onChange={(e) => onUpdate({ stack: e.target.value })}
        readOnly={draft.stackAuto}
        placeholder='e.g. "Inter, ui-sans-serif, system-ui, sans-serif"'
        className={`${inputBase} w-full font-mono text-xs ${
          draft.stackAuto ? 'bg-stone-50 text-stone-600' : ''
        }`}
      />
    </div>
  );
}

function CssField({
  draft,
  onUpdate,
}: {
  draft: DraftTypeface;
  onUpdate: (patch: Partial<DraftTypeface>) => void;
}) {
  const isSelfHosted = draft.provider === 'self-hosted';
  const auto = isSelfHosted && draft.cssImportAuto;
  const value = auto ? effectiveCss(draft) : draft.cssImport;
  const lineCount =
    isSelfHosted && draft.files.filter((f) => f.url).length > 0
      ? Math.max(3, draft.files.filter((f) => f.url).length * 6)
      : 3;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-stone-500">
          {isSelfHosted ? '@font-face' : 'CSS'}
        </span>
        {isSelfHosted && (
          <label className="text-[11px] text-stone-500 flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.cssImportAuto}
              onChange={(e) =>
                onUpdate({
                  cssImportAuto: e.target.checked,
                  cssImport: e.target.checked
                    ? draft.cssImport
                    : effectiveCss(draft) || draft.cssImport,
                })
              }
            />
            auto-generate
          </label>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onUpdate({ cssImport: e.target.value })}
        readOnly={auto}
        rows={lineCount}
        placeholder={
          isSelfHosted
            ? 'Add files above — @font-face block auto-generates here'
            : 'Optional CSS to drop into a stylesheet'
        }
        className={`${inputBase} w-full font-mono text-[11px] leading-relaxed ${
          auto ? 'bg-stone-50 text-stone-700' : ''
        }`}
      />
    </div>
  );
}

/**
 * Convert anything pasted into the cssImport field into something usable
 * inside a <style> tag for live preview. <link> tags become @import.
 */
function previewCssFor(d: DraftTypeface): string {
  const css = effectiveCss(d) || d.cssImport;
  if (!css) return '';
  const linkMatch = css.match(/<link[^>]+href=['"]([^'"]+)['"]/i);
  if (linkMatch) return `@import url('${linkMatch[1]}');`;
  return css;
}

function FontPreview({
  family,
  weights,
  cssImport,
}: {
  family: string;
  weights: number[];
  cssImport: string;
}) {
  const sample = 'The quick brown fox jumps over the lazy dog';
  const fontFamily = /\s/.test(family) ? `'${family}'` : family;
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-2 overflow-hidden">
      {cssImport && (
        <style dangerouslySetInnerHTML={{ __html: cssImport }} />
      )}
      {weights.map((w, i) => (
        <div
          key={`${w}-${i}`}
          className="flex items-baseline gap-3 border-b border-stone-100 last:border-b-0 pb-2 last:pb-0"
        >
          <span className="text-[10px] text-stone-400 font-mono w-8 shrink-0 tabular-nums">
            {w}
          </span>
          <span
            style={{ fontFamily, fontWeight: w }}
            className="text-2xl text-stone-800 leading-tight truncate"
          >
            {sample}
          </span>
        </div>
      ))}
    </div>
  );
}
