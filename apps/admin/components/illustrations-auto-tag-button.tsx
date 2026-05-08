'use client';

import { useActionState } from 'react';
import {
  autoTagIllustrations,
  type AutoTagResult,
} from '@/app/actions/illustrations';

const initial: AutoTagResult | null = null;

export function IllustrationsAutoTagButton({ brandId }: { brandId: string }) {
  const [state, action, isPending] = useActionState(
    autoTagIllustrations,
    initial,
  );

  return (
    <div className="space-y-2">
      <form action={action} className="flex gap-2 flex-wrap">
        <input type="hidden" name="brandId" value={brandId} />
        <button
          type="submit"
          name="mode"
          value="untagged"
          disabled={isPending}
          className="rounded border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-900 hover:bg-stone-50 disabled:opacity-50"
        >
          {isPending ? 'Tagging…' : 'AI auto-tag untagged'}
        </button>
        <button
          type="submit"
          name="mode"
          value="all"
          disabled={isPending}
          className="rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-50 disabled:opacity-50"
        >
          {isPending ? '…' : 'Re-tag all'}
        </button>
      </form>

      {state && (
        <div
          className={`rounded border px-3 py-2 text-xs ${
            state.ok
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : 'border-amber-300 bg-amber-50 text-amber-900'
          }`}
        >
          <div>{state.message}</div>
          {state.errors && state.errors.length > 0 && (
            <details className="mt-1.5">
              <summary className="cursor-pointer">
                {state.errors.length} errors
              </summary>
              <ul className="mt-1 space-y-0.5 font-mono">
                {state.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
                {state.errors.length > 10 && (
                  <li className="opacity-70">… and {state.errors.length - 10} more</li>
                )}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
