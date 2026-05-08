'use client';

import { useActionState } from 'react';
import {
  importFromFilesystem,
  type ImportResult,
} from '@/app/actions/import';

const initial: ImportResult | null = null;

export function ImportButton() {
  const [state, action, isPending] = useActionState(
    importFromFilesystem,
    initial,
  );

  return (
    <div className="space-y-3">
      <form action={action} className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="mode"
          value="add-only"
          disabled={isPending}
          className="rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
        >
          {isPending ? 'Importing…' : 'Import new items only (safe)'}
        </button>
        <button
          type="submit"
          name="mode"
          value="overwrite"
          disabled={isPending}
          className="rounded border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-100 disabled:opacity-50"
          title="DESTRUCTIVE: overwrites existing items, including any uploaded asset URLs and hand-edited content."
        >
          {isPending ? 'Importing…' : 'Force re-seed (destructive)'}
        </button>
      </form>

      <p className="text-xs text-stone-500 max-w-xl">
        <strong className="text-stone-700">Add-only</strong> skips items that
        already exist in Postgres — so it won&apos;t touch your uploaded asset
        URLs or any item you&apos;ve edited in the admin. Use this for adding
        new templates / facets after a code change.{' '}
        <strong className="text-stone-700">Force re-seed</strong> overwrites
        every matching id with the filesystem version — only use this on a
        fresh database or when you intentionally want to discard local edits.
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
              {state.brands} brands, {state.customFacets ?? 0} custom facets,{' '}
              {state.items} items added
              {state.mode === 'add-only' && state.itemsSkipped !== undefined
                ? `, ${state.itemsSkipped} preserved`
                : ''}
              .
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
