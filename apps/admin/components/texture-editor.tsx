'use client';

import { useId, useState } from 'react';
import type { Texture } from '@jasper-brain/core';

const inputBase =
  'rounded border border-stone-300 bg-white px-2.5 py-1.5 text-sm focus:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-700';

const PRESETS: Array<{ id: string; label: string; css: string }> = [
  {
    id: 'subtle-grain',
    label: 'Subtle grain',
    css: `background-color: #fafaf9;
background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
background-blend-mode: multiply;`,
  },
  {
    id: 'diagonal-stripes',
    label: 'Diagonal stripes',
    css: `background: repeating-linear-gradient(
  45deg,
  #f5f5f4,
  #f5f5f4 8px,
  #fafaf9 8px,
  #fafaf9 16px
);`,
  },
  {
    id: 'dot-grid',
    label: 'Dot grid',
    css: `background-color: #fafaf9;
background-image: radial-gradient(circle, #d6d3d1 1px, transparent 1px);
background-size: 16px 16px;`,
  },
  {
    id: 'soft-gradient',
    label: 'Soft gradient',
    css: `background: linear-gradient(
  135deg,
  #f5f3ff 0%,
  #fafaf9 50%,
  #f0fdf4 100%
);`,
  },
];

export function TextureEditor({ defaultValue }: { defaultValue?: Texture }) {
  const [css, setCss] = useState(defaultValue?.css ?? '');
  const [background, setBackground] = useState<'light' | 'dark' | 'either'>(
    defaultValue?.background ?? 'either',
  );
  const [use, setUse] = useState(defaultValue?.use ?? '');
  const [body, setBody] = useState(defaultValue?.body ?? '');

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setCss(preset.css);
  };

  return (
    <div className="space-y-5">
      <PresetGrid presets={PRESETS} onPick={applyPreset} />

      <CssField value={css} onChange={setCss} />

      <BackgroundField value={background} onChange={setBackground} />

      <div className="space-y-1">
        <label className="text-sm font-medium text-stone-800">When to use</label>
        <textarea
          name="use"
          value={use}
          onChange={(e) => setUse(e.target.value)}
          rows={2}
          placeholder='e.g. "Hero sections to add subtle warmth without competing with content."'
          className={`${inputBase} w-full`}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-stone-800">
          Notes (markdown)
        </label>
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Pairing rules, do's and don'ts, accessibility considerations…"
          className={`${inputBase} w-full font-mono text-xs`}
        />
      </div>

      <TexturePreview css={css} background={background} />
    </div>
  );
}

function PresetGrid({
  presets,
  onPick,
}: {
  presets: typeof PRESETS;
  onPick: (preset: (typeof PRESETS)[number]) => void;
}) {
  return (
    <section className="space-y-2">
      <div className="text-xs uppercase tracking-wide text-stone-500 font-semibold">
        Start from a preset
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {presets.map((p) => (
          <PresetCard key={p.id} preset={p} onPick={() => onPick(p)} />
        ))}
      </div>
    </section>
  );
}

function PresetCard({
  preset,
  onPick,
}: {
  preset: (typeof PRESETS)[number];
  onPick: () => void;
}) {
  const previewId = useId();
  const safe = `_${previewId.replace(/[^\w-]/g, '')}`;
  return (
    <button
      type="button"
      onClick={onPick}
      className="rounded-lg border border-stone-200 bg-white overflow-hidden hover:border-stone-500 transition-colors text-left"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `.${safe} { ${preset.css} }`,
        }}
      />
      <div className={`${safe} h-16 w-full`} />
      <div className="px-3 py-1.5 text-xs font-medium text-stone-700">
        {preset.label}
      </div>
    </button>
  );
}

function CssField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-stone-800">
        CSS
        <span className="text-red-600 ml-0.5">*</span>
      </label>
      <textarea
        name="css"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        rows={Math.max(6, value.split('\n').length + 1)}
        placeholder={`background-color: #fafaf9;\nbackground-image: linear-gradient(...);`}
        className={`${inputBase} w-full font-mono text-xs leading-relaxed`}
      />
      <p className="text-xs text-stone-500">
        Plain CSS rules — what gets applied to a div to create the texture. No
        selector wrapper. Edit the preset above or write from scratch.
      </p>
    </div>
  );
}

function BackgroundField({
  value,
  onChange,
}: {
  value: 'light' | 'dark' | 'either';
  onChange: (v: 'light' | 'dark' | 'either') => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-stone-800">
        Intended background
      </label>
      <select
        name="background"
        value={value}
        onChange={(e) =>
          onChange(e.target.value as 'light' | 'dark' | 'either')
        }
        className={inputBase}
      >
        <option value="either">Either (works on light and dark)</option>
        <option value="light">Light surfaces only</option>
        <option value="dark">Dark surfaces only</option>
      </select>
    </div>
  );
}

function TexturePreview({
  css,
  background,
}: {
  css: string;
  background: 'light' | 'dark' | 'either';
}) {
  const lightId = useId();
  const darkId = useId();
  const safeLight = `_${lightId.replace(/[^\w-]/g, '')}`;
  const safeDark = `_${darkId.replace(/[^\w-]/g, '')}`;
  const showLight = background !== 'dark';
  const showDark = background !== 'light';

  return (
    <section className="space-y-2">
      <div className="text-xs uppercase tracking-wide text-stone-500 font-semibold">
        Live preview
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: css
            ? `.${safeLight} { ${css} }\n.${safeDark} { ${css} }`
            : '',
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        {showLight && (
          <PreviewTile label="On light surface" bg="#fafaf9">
            <div className={`${safeLight} h-40 w-full rounded`} />
          </PreviewTile>
        )}
        {showDark && (
          <PreviewTile label="On dark surface" bg="#0c0a09" textLight>
            <div className={`${safeDark} h-40 w-full rounded`} />
          </PreviewTile>
        )}
      </div>
      {!css && (
        <p className="text-xs text-stone-500">
          Add some CSS above and the preview will render here.
        </p>
      )}
    </section>
  );
}

function PreviewTile({
  label,
  bg,
  textLight,
  children,
}: {
  label: string;
  bg: string;
  textLight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg border border-stone-200 p-3 space-y-2"
      style={{ backgroundColor: bg }}
    >
      <div
        className={`text-[10px] uppercase tracking-wide ${
          textLight ? 'text-stone-300' : 'text-stone-500'
        }`}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
