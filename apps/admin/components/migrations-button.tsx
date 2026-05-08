'use client';

import { useActionState } from 'react';
import {
  runDataMigrations,
  type MigrationActionResult,
} from '@/app/actions/import';

const initial: MigrationActionResult | null = null;

export function MigrationsButton() {
  const [state, action, isPending] = useActionState(runDataMigrations, initial);

  return (
    <div className="space-y-3">
      <form action={action}>
        <button
          type="submit"
          disabled={isPending}
          className="rounded border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-50 disabled:opacity-50"
          title="Runs targeted, idempotent fix-ups for known field drift (rebrand colours, stale Tiempos refs, etc.). Safe to click — only patches fields that match known stale values."
        >
          {isPending ? 'Running…' : 'Apply data migrations'}
        </button>
      </form>

      <p className="text-xs text-stone-500 max-w-xl">
        Targeted fix-ups for fields that drifted between seed pushes —
        e.g. the May 2026 Brand-purple → Brand-red swap, or removing
        stale Tiempos references from the typography scale. Idempotent:
        clicking again after a successful run is a no-op.
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
          {state.perBrand && Object.entries(state.perBrand).length > 0 && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer">
                Per-brand details
              </summary>
              <div className="text-xs mt-2 space-y-2 font-mono">
                {Object.entries(state.perBrand).map(([brandId, r]) => (
                  <div key={brandId}>
                    <div className="font-medium">{brandId}:</div>
                    {r.applied.length > 0 ? (
                      <ul className="ml-3 mt-0.5">
                        {r.applied.map((m, i) => (
                          <li key={i}>✓ {m}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="ml-3 mt-0.5 text-stone-500">
                        no migrations needed
                      </div>
                    )}
                    {r.errors.length > 0 && (
                      <ul className="ml-3 mt-0.5 text-red-700">
                        {r.errors.map((e, i) => (
                          <li key={i}>✗ {e}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
