'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import {
  createCustomFacet,
  type FacetActionState,
} from '@/app/actions/facets';
import { SelectField, TextArea, TextField } from './fields';

const initial: FacetActionState = { error: null };

export interface GroupOption {
  id: string;
  label: string;
}

export function NewFacetForm({
  brandId,
  groups,
}: {
  brandId: string;
  groups: GroupOption[];
}) {
  const [state, action, isPending] = useActionState(createCustomFacet, initial);

  return (
    <form action={action} className="space-y-5 max-w-2xl">
      <input type="hidden" name="brandId" value={brandId} />

      <TextField
        name="id"
        label="Facet ID"
        required
        placeholder="e.g. compliance-disclaimer"
        hint="Lowercase, hyphenated. This is what tools see — make it readable."
      />
      <TextField
        name="label"
        label="Label (singular)"
        required
        placeholder="e.g. Compliance disclaimer"
      />
      <TextField
        name="pluralLabel"
        label="Label (plural)"
        placeholder="e.g. Compliance disclaimers"
        hint="Optional. Defaults to singular if omitted."
      />
      <TextArea
        name="blurb"
        label="Description"
        rows={2}
        placeholder="One-line description of what this facet holds."
      />
      <SelectField
        name="group"
        label="Group"
        defaultValue="custom"
        hint="Where this facet shows up on the brand page."
        options={groups.map((g) => ({ value: g.id, label: g.label }))}
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
          {isPending ? 'Creating…' : 'Create facet'}
        </button>
        <Link
          href={`/brands/${brandId}`}
          className="text-sm text-stone-600 hover:text-stone-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
