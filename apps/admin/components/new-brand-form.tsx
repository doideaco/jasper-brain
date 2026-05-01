'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { createBrand, type BrandActionState } from '@/app/actions/brand';
import { TextArea, TextField } from './fields';

const initial: BrandActionState = { error: null };

export function NewBrandForm() {
  const [state, action, isPending] = useActionState(createBrand, initial);

  return (
    <form action={action} className="space-y-5 max-w-2xl">
      <TextField
        name="name"
        label="Brand name"
        required
        placeholder="e.g. Acme"
      />
      <TextField
        name="id"
        label="Brand ID"
        hint="Lowercase, hyphenated. Auto-derived from name if left blank."
        placeholder="acme"
      />
      <TextField
        name="tagline"
        label="Tagline"
        hint="Optional. Add it now, or later from the brand profile."
      />
      <TextArea
        name="description"
        label="Description"
        rows={3}
        hint="Optional. One paragraph — what the brand does and for whom."
      />

      {state.error && (
        <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
        >
          {isPending ? 'Creating…' : 'Create brand'}
        </button>
        <Link
          href="/brands"
          className="text-sm text-stone-600 hover:text-stone-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
