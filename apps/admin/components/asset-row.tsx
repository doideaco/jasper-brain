'use client';

import { useTransition, useState } from 'react';
import type { UploadedAsset } from '@/lib/blob';
import { deleteAsset } from '@/app/actions/assets';

const IMAGE_MIMES = new Set([
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

export function AssetRow({
  brandId,
  asset,
}: {
  brandId: string;
  asset: UploadedAsset;
}) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const fileName = asset.pathname.split('/').pop() ?? asset.pathname;
  const isImage = IMAGE_MIMES.has(asset.contentType);

  const onCopy = async () => {
    const fullUrl = asset.url.startsWith('http')
      ? asset.url
      : `${window.location.origin}${asset.url}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onDelete = (formData: FormData) => {
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;
    startTransition(() => {
      void deleteAsset(formData);
    });
  };

  return (
    <li className="flex items-center gap-4 px-4 py-3 hover:bg-stone-50">
      <div className="w-12 h-12 shrink-0 rounded border border-stone-200 bg-white overflow-hidden flex items-center justify-center">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.url}
            alt={fileName}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <span className="text-[10px] uppercase tracking-wide text-stone-400 font-mono">
            {fileName.split('.').pop()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-sm truncate">{fileName}</div>
        <div className="text-xs text-stone-500">
          {asset.contentType} · {formatBytes(asset.size)}
        </div>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="text-sm text-stone-700 hover:text-stone-900 font-medium"
      >
        {copied ? 'Copied!' : 'Copy URL'}
      </button>
      <form action={onDelete}>
        <input type="hidden" name="brandId" value={brandId} />
        <input type="hidden" name="pathname" value={asset.pathname} />
        <button
          type="submit"
          disabled={isPending}
          className="text-sm text-red-700 hover:text-red-900 disabled:opacity-50"
        >
          {isPending ? '…' : 'Delete'}
        </button>
      </form>
    </li>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
