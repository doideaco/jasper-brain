'use client';

import { useActionState, useState } from 'react';
import {
  bulkCreateIllustrations,
  type BulkUploadResult,
} from '@/app/actions/illustrations';

const initial: BulkUploadResult | null = null;

export function IllustrationBulkUpload({ brandId }: { brandId: string }) {
  const [state, action, isPending] = useActionState(
    bulkCreateIllustrations,
    initial,
  );
  const [fileCount, setFileCount] = useState(0);

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-3">
        <input type="hidden" name="brandId" value={brandId} />

        <label className="block">
          <span className="text-sm font-medium text-stone-800 mb-1.5 block">
            Pick files (or drop a folder)
          </span>
          <input
            type="file"
            name="files"
            multiple
            accept="image/webp,image/png,image/svg+xml,image/jpeg,image/gif"
            onChange={(e) => setFileCount(e.target.files?.length ?? 0)}
            className="block w-full text-sm text-stone-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-stone-900 file:text-white hover:file:bg-stone-800 file:cursor-pointer"
          />
          {fileCount > 0 && (
            <span className="block mt-2 text-xs text-stone-500">
              {fileCount} file{fileCount === 1 ? '' : 's'} selected. Click upload to start.
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={isPending || fileCount === 0}
          className="rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
        >
          {isPending
            ? `Uploading ${fileCount} file${fileCount === 1 ? '' : 's'}…`
            : `Upload & create items (${fileCount})`}
        </button>
      </form>

      <p className="text-xs text-stone-500 max-w-2xl">
        Each file is uploaded to Blob and gets its own Illustration item with
        the filename as the default name. Mood / subject / pairsWith are left
        blank — fill them in by hand on each item, or use the AI auto-tag
        button on the Illustrations list to do it in bulk.
      </p>

      {state && (
        <div
          className={`rounded border px-4 py-3 text-sm ${
            state.ok
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : 'border-red-300 bg-red-50 text-red-800'
          }`}
        >
          <div className="font-medium">{state.message}</div>
          {state.ok && (
            <div className="text-xs mt-1.5 text-emerald-700">
              {state.uploaded} uploaded, {state.itemsCreated} items created.
            </div>
          )}
          {state.errors && state.errors.length > 0 && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer">
                {state.errors.length} item-level errors
              </summary>
              <ul className="text-xs mt-1 space-y-0.5 font-mono">
                {state.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
