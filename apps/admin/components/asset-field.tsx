'use client';

import { useId, useRef, useState } from 'react';
import type { UploadedAsset } from '@/lib/blob';

const FONT_EXTS = /\.(woff2?|ttf|otf)$/i;
const IMAGE_MIMES = new Set([
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

export type AssetAccept = 'image' | 'font' | 'any';

function matchesAccept(asset: UploadedAsset, accept: AssetAccept): boolean {
  if (accept === 'any') return true;
  if (accept === 'image') return IMAGE_MIMES.has(asset.contentType);
  if (accept === 'font') {
    return (
      asset.contentType.startsWith('font/') ||
      FONT_EXTS.test(asset.pathname)
    );
  }
  return true;
}

function fullUrl(asset: UploadedAsset): string {
  if (asset.url.startsWith('http')) return asset.url;
  if (typeof window === 'undefined') return asset.url;
  return `${window.location.origin}${asset.url}`;
}

const inputBase =
  'rounded border border-stone-300 bg-white px-2.5 py-1.5 text-sm focus:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-700';

export interface AssetFieldProps {
  /** When provided, the input submits with this name as part of an enclosing form. */
  name?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** When provided, makes the field controlled. */
  value?: string;
  /** Fires on every value change (typing or pick). */
  onChange?: (value: string) => void;

  assets: UploadedAsset[];
  accept?: AssetAccept;
  placeholder?: string;

  label?: string;
  hint?: string;
  required?: boolean;
}

export function AssetField({
  name,
  defaultValue = '',
  value,
  onChange,
  assets,
  accept = 'any',
  placeholder = 'Paste a URL or click Browse',
  label,
  hint,
  required,
}: AssetFieldProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const current = isControlled ? value : internalValue;

  const inputId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const update = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const filtered = assets.filter((asset) => matchesAccept(asset, accept));

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  const pick = (asset: UploadedAsset) => {
    update(fullUrl(asset));
    close();
  };

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-stone-800">
          {label}
          {required && <span className="text-red-600 ml-0.5">*</span>}
        </label>
      )}
      <div className={`flex gap-2 ${label ? 'mt-1' : ''}`}>
        <input
          id={inputId}
          type="text"
          name={name}
          value={current}
          onChange={(e) => update(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`${inputBase} flex-1 font-mono text-xs`}
        />
        <button
          type="button"
          onClick={open}
          disabled={filtered.length === 0}
          className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          title={
            filtered.length === 0
              ? 'No matching assets uploaded yet'
              : `Browse ${filtered.length} asset${filtered.length === 1 ? '' : 's'}`
          }
        >
          Browse
        </button>
      </div>
      {hint && <p className="text-xs text-stone-500 mt-0.5">{hint}</p>}

      <dialog
        ref={dialogRef}
        className="rounded-lg p-0 w-full max-w-3xl backdrop:bg-black/40"
        onClick={(e) => {
          // Click on backdrop closes the dialog
          if (e.target === dialogRef.current) close();
        }}
      >
        <div className="p-5">
          <header className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Pick an asset
              <span className="text-xs font-normal text-stone-500 ml-2">
                {filtered.length} available
              </span>
            </h2>
            <button
              type="button"
              onClick={close}
              className="text-sm text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
          </header>

          {filtered.length === 0 ? (
            <div className="rounded border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
              No matching assets uploaded yet.
            </div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto">
              {filtered.map((asset) => {
                const fileName =
                  asset.pathname.split('/').pop() ?? asset.pathname;
                const isImage = IMAGE_MIMES.has(asset.contentType);
                const ext = fileName.split('.').pop()?.toUpperCase() ?? '';
                return (
                  <li key={asset.pathname}>
                    <button
                      type="button"
                      onClick={() => pick(asset)}
                      className="w-full rounded-lg border border-stone-200 hover:border-stone-700 hover:shadow-sm p-3 text-left transition-all bg-white"
                    >
                      <div className="aspect-square flex items-center justify-center bg-stone-50 rounded mb-2 overflow-hidden">
                        {isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.url}
                            alt={fileName}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-stone-500 bg-stone-200 px-2 py-1 rounded">
                            {ext}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono truncate text-stone-800">
                        {fileName}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {asset.contentType}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </dialog>
    </div>
  );
}
