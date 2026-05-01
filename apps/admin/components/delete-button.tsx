'use client';

import { useTransition } from 'react';
import { deleteArtifact } from '@/app/actions/artifacts';

export function DeleteButton({
  brandId,
  facetId,
  id,
  label,
}: {
  brandId: string;
  facetId: string;
  id: string;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    startTransition(() => {
      void deleteArtifact(formData);
    });
  };

  return (
    <form action={onSubmit}>
      <input type="hidden" name="brandId" value={brandId} />
      <input type="hidden" name="facetId" value={facetId} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isPending}
        className="text-sm text-red-700 hover:text-red-900 disabled:opacity-50"
      >
        {isPending ? 'Deleting…' : 'Delete'}
      </button>
    </form>
  );
}
