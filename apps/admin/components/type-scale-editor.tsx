'use client';

import { useEffect, useRef, useState } from 'react';
import { stringify as stringifyYaml } from 'yaml';
import type { Typeface, TypeScaleStep } from '@jasper-brain/core';

interface DraftStep {
  name: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  letterSpacing: string;
  use: string;
}

const DEFAULT_STEP: DraftStep = {
  name: '',
  fontSize: '',
  lineHeight: '',
  fontWeight: '',
  letterSpacing: '',
  use: '',
};

function toDraft(step: TypeScaleStep): DraftStep {
  return {
    name: step.name,
    fontSize: step.fontSize,
    lineHeight: step.lineHeight ?? '',
    fontWeight: step.fontWeight !== undefined ? String(step.fontWeight) : '',
    letterSpacing: step.letterSpacing ?? '',
    use: step.use ?? '',
  };
}

export function draftToScaleStep(d: DraftStep): TypeScaleStep | null {
  if (!d.name || !d.fontSize) return null;
  const out: TypeScaleStep = {
    name: d.name,
    fontSize: d.fontSize,
  };
  if (d.lineHeight) out.lineHeight = d.lineHeight;
  if (d.fontWeight) {
    const w = parseInt(d.fontWeight, 10);
    if (!Number.isNaN(w)) out.fontWeight = w;
  }
  if (d.letterSpacing) out.letterSpacing = d.letterSpacing;
  if (d.use) out.use = d.use;
  return out;
}

export function scaleToYaml(steps: TypeScaleStep[]): string {
  if (steps.length === 0) return '[]';
  return stringifyYaml(steps).trimEnd();
}

const inputBase =
  'rounded border border-stone-300 bg-white px-2.5 py-1.5 text-sm focus:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-700';

/**
 * Pick the typeface a given scale step should be rendered in.
 * Steps named display/h1/h2/h3 prefer a "display"-roled typeface;
 * mono/code prefer a "mono" typeface; everything else falls back to
 * the primary typeface (or first one available).
 */
function typefaceForStep(
  step: TypeScaleStep,
  typefaces: Typeface[],
): Typeface | undefined {
  if (typefaces.length === 0) return undefined;
  const name = step.name.toLowerCase();
  const find = (predicate: (tf: Typeface) => boolean) =>
    typefaces.find(predicate);
  if (/mono|code/.test(name)) {
    const m = find((tf) => /mono/i.test(tf.role));
    if (m) return m;
  }
  if (/display|h1|h2|h3|hero/.test(name)) {
    const d = find((tf) => /display/i.test(tf.role));
    if (d) return d;
  }
  return (
    find((tf) => /primary/i.test(tf.role)) ??
    find((tf) => tf.role === 'body' || /body|text/i.test(tf.role)) ??
    typefaces[0]
  );
}

export function TypeScaleEditor({
  defaultValue,
  typefaces = [],
  onChange,
}: {
  defaultValue?: TypeScaleStep[];
  typefaces?: Typeface[];
  onChange?: (steps: TypeScaleStep[]) => void;
}) {
  const [drafts, setDrafts] = useState<DraftStep[]>(
    defaultValue && defaultValue.length > 0
      ? defaultValue.map(toDraft)
      : [{ ...DEFAULT_STEP }],
  );

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
    const steps = drafts
      .map(draftToScaleStep)
      .filter((s): s is TypeScaleStep => s !== null);
    onChange?.(steps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drafts]);

  const update = (idx: number, patch: Partial<DraftStep>) => {
    setDrafts((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
    );
  };
  const remove = (idx: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== idx));
  };
  const add = () => {
    setDrafts((prev) => [...prev, { ...DEFAULT_STEP }]);
  };

  // Steps that have enough info to preview
  const previewSteps = drafts
    .map(draftToScaleStep)
    .filter((s): s is TypeScaleStep => s !== null);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium text-stone-800">Type scale</div>
        <p className="text-xs text-stone-500 mt-0.5">
          Each step is a named size — display, h1, body, caption. Steps render
          live below using the typefaces from the section above.
        </p>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
        <div className="grid grid-cols-[1fr_5rem_5rem_5rem_5rem_2fr_2rem] gap-2 px-3 py-2 bg-stone-50 text-[10px] uppercase tracking-wide text-stone-500 font-semibold">
          <span>Name</span>
          <span>Size</span>
          <span>Line</span>
          <span>Weight</span>
          <span>Tracking</span>
          <span>Use</span>
          <span></span>
        </div>
        <ul className="divide-y divide-stone-100">
          {drafts.map((draft, idx) => (
            <li
              key={idx}
              className="grid grid-cols-[1fr_5rem_5rem_5rem_5rem_2fr_2rem] gap-2 px-3 py-2 items-center"
            >
              <input
                type="text"
                value={draft.name}
                onChange={(e) => update(idx, { name: e.target.value })}
                placeholder="h1"
                className={inputBase}
                aria-label="Step name"
              />
              <input
                type="text"
                value={draft.fontSize}
                onChange={(e) => update(idx, { fontSize: e.target.value })}
                placeholder="48px"
                className={`${inputBase} font-mono text-xs`}
                aria-label="Font size"
              />
              <input
                type="text"
                value={draft.lineHeight}
                onChange={(e) =>
                  update(idx, { lineHeight: e.target.value })
                }
                placeholder="1.1"
                className={`${inputBase} font-mono text-xs`}
                aria-label="Line height"
              />
              <input
                type="text"
                value={draft.fontWeight}
                onChange={(e) =>
                  update(idx, { fontWeight: e.target.value })
                }
                placeholder="600"
                className={`${inputBase} font-mono text-xs`}
                aria-label="Font weight"
              />
              <input
                type="text"
                value={draft.letterSpacing}
                onChange={(e) =>
                  update(idx, { letterSpacing: e.target.value })
                }
                placeholder="-0.02em"
                className={`${inputBase} font-mono text-xs`}
                aria-label="Letter spacing"
              />
              <input
                type="text"
                value={draft.use}
                onChange={(e) => update(idx, { use: e.target.value })}
                placeholder="Page titles."
                className={inputBase}
                aria-label="Usage"
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                disabled={drafts.length === 1}
                className="text-xs text-red-700 hover:text-red-900 disabled:opacity-30"
                aria-label="Remove step"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={add}
        className="text-sm text-stone-700 hover:text-stone-900 font-medium"
      >
        + Add step
      </button>

      <ScalePreview steps={previewSteps} typefaces={typefaces} />
    </div>
  );
}

/**
 * Live preview of every scale step rendered in the appropriate typeface.
 * Combines all typefaces' cssImport so font files are loaded.
 */
function ScalePreview({
  steps,
  typefaces,
}: {
  steps: TypeScaleStep[];
  typefaces: Typeface[];
}) {
  if (steps.length === 0 || typefaces.length === 0) return null;

  const combinedCss = typefaces
    .map((tf) => previewCssFor(tf))
    .filter(Boolean)
    .join('\n\n');

  return (
    <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
      {combinedCss && (
        <style dangerouslySetInnerHTML={{ __html: combinedCss }} />
      )}
      <div className="px-4 py-3 bg-stone-50 border-b border-stone-100 text-[10px] uppercase tracking-wide text-stone-500 font-semibold flex items-center justify-between">
        <span>Live preview</span>
        <span className="font-normal lowercase tracking-normal text-stone-400">
          rendered in your typefaces
        </span>
      </div>
      <ul className="divide-y divide-stone-100">
        {steps.map((step, idx) => {
          const tf = typefaceForStep(step, typefaces);
          const family = tf
            ? /\s/.test(tf.family)
              ? `'${tf.family}'`
              : tf.family
            : 'inherit';
          const sample = sampleFor(step.name);
          return (
            <li key={`${step.name}-${idx}`} className="px-4 py-3">
              <div className="flex items-baseline gap-3 mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wide text-stone-500 w-16 shrink-0">
                  {step.name}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {step.fontSize}
                  {step.lineHeight && ` · ${step.lineHeight}`}
                  {step.fontWeight && ` · ${step.fontWeight}`}
                  {step.letterSpacing && ` · ${step.letterSpacing}`}
                  {tf && (
                    <span className="text-stone-400">
                      {' · '}
                      {tf.family}
                    </span>
                  )}
                </span>
              </div>
              <div
                style={{
                  fontFamily: family,
                  fontSize: step.fontSize,
                  lineHeight: step.lineHeight ?? undefined,
                  fontWeight: step.fontWeight ?? undefined,
                  letterSpacing: step.letterSpacing ?? undefined,
                }}
                className="text-stone-900 break-words"
              >
                {sample}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function previewCssFor(tf: Typeface): string {
  const css = tf.source?.cssImport ?? '';
  if (!css) return '';
  // Convert <link> tags to @import for inline-style-tag use
  const linkMatch = css.match(/<link[^>]+href=['"]([^'"]+)['"]/i);
  if (linkMatch) return `@import url('${linkMatch[1]}');`;
  return css;
}

function sampleFor(stepName: string): string {
  const n = stepName.toLowerCase();
  if (n === 'display' || n.includes('hero')) {
    return 'Brand for the AI era.';
  }
  if (n === 'h1' || n === 'h2' || n === 'h3') {
    return 'Content that ships';
  }
  if (n.includes('caption') || n.includes('eyebrow') || n.includes('label')) {
    return 'EYEBROW · METADATA';
  }
  if (n.includes('mono') || n.includes('code')) {
    return 'const brand = new Brain()';
  }
  return 'The quick brown fox jumps over the lazy dog.';
}
