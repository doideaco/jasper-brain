'use client';

import { useState } from 'react';
import { stringify as stringifyYaml } from 'yaml';
import type { TypeScaleStep } from '@jasper-brain/core';

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

function serialize(drafts: DraftStep[]): string {
  const steps = drafts
    .filter((d) => d.name && d.fontSize)
    .map((d) => {
      const out: Record<string, unknown> = {
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
    });
  if (steps.length === 0) return '[]';
  return stringifyYaml(steps).trimEnd();
}

const inputBase =
  'rounded border border-stone-300 bg-white px-2.5 py-1.5 text-sm focus:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-700';

export function TypeScaleEditor({
  defaultValue,
}: {
  defaultValue?: TypeScaleStep[];
}) {
  const [drafts, setDrafts] = useState<DraftStep[]>(
    defaultValue && defaultValue.length > 0
      ? defaultValue.map(toDraft)
      : [{ ...DEFAULT_STEP }],
  );

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

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-medium text-stone-800">Type scale</div>
        <p className="text-xs text-stone-500 mt-0.5">
          Each step is a named size — display, h1, body, caption, etc.
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

      <input type="hidden" name="scale" value={serialize(drafts)} />
    </div>
  );
}
