'use client';

import { useState } from 'react';
import type { UploadedAsset } from '@/lib/blob';

export function AssetPicker({
  brandId,
  assets,
}: {
  brandId: string;
  assets: UploadedAsset[];
}) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const onCopy = async (asset: UploadedAsset) => {
    const fullUrl = asset.url.startsWith('http')
      ? asset.url
      : `${window.location.origin}${asset.url}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopiedPath(asset.pathname);
    setTimeout(() => setCopiedPath(null), 1500);
  };

  if (assets.length === 0) {
    return (
      <div className="rounded border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
        No uploaded assets yet.{' '}
        <a
          href={`/brands/${brandId}/assets`}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-stone-900"
        >
          Upload some →
        </a>
      </div>
    );
  }

  return (
    <details
      open
      className="rounded border border-stone-200 bg-white"
    >
      <summary className="cursor-pointer list-none px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-500 flex items-center justify-between">
        <span>Uploaded assets ({assets.length})</span>
        <a
          href={`/brands/${brandId}/assets`}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-normal normal-case tracking-normal text-stone-600 underline hover:text-stone-900"
        >
          Manage →
        </a>
      </summary>
      <ul className="divide-y divide-stone-100 max-h-64 overflow-y-auto">
        {assets.map((asset) => {
          const fileName = asset.pathname.split('/').pop() ?? asset.pathname;
          const copied = copiedPath === asset.pathname;
          return (
            <li
              key={asset.pathname}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-stone-50"
            >
              <code className="flex-1 truncate text-xs font-mono text-stone-700">
                {fileName}
              </code>
              <span className="text-[10px] uppercase tracking-wide text-stone-400 shrink-0">
                {asset.contentType.split('/').pop()}
              </span>
              <button
                type="button"
                onClick={() => onCopy(asset)}
                className="text-xs font-medium text-stone-700 hover:text-stone-900 shrink-0"
              >
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
