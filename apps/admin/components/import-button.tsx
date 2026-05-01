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
      <form action={action}>
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
        >
          {isPending ? 'Importing…' : 'Import filesystem brands → Postgres'}
        </button>
      </form>

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
              {state.items} items.
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
