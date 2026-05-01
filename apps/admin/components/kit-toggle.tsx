'use client';

import { useState } from 'react';

export function KitToggle({
  visual,
  json,
}: {
  visual: React.ReactNode;
  json: string;
}) {
  const [view, setView] = useState<'visual' | 'json'>('visual');
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <div className="inline-flex rounded border border-stone-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setView('visual')}
            className={`px-3 py-1 text-sm rounded ${
              view === 'visual'
                ? 'bg-stone-900 text-white'
                : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setView('json')}
            className={`px-3 py-1 text-sm rounded ${
              view === 'json'
                ? 'bg-stone-900 text-white'
                : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            Raw JSON
          </button>
        </div>
        {view === 'json' && (
          <button
            type="button"
            onClick={onCopy}
            className="text-sm text-stone-700 hover:text-stone-900 font-medium"
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        )}
      </div>

      {view === 'visual' ? (
        visual
      ) : (
        <pre className="rounded-lg border border-stone-200 bg-white p-4 text-xs leading-relaxed overflow-x-auto font-mono text-stone-800">
          {json}
        </pre>
      )}
    </>
  );
}
