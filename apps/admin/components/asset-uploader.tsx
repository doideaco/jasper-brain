'use client';

import { useActionState, useRef } from 'react';
import { uploadAsset, type UploadResult } from '@/app/actions/assets';

const initial: UploadResult = {};

export function AssetUploader({ brandId }: { brandId: string }) {
  const [state, action, isPending] = useActionState(uploadAsset, initial);
  const formRef = useRef<HTMLFormElement>(null);

  if (state.asset && formRef.current) {
    formRef.current.reset();
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 p-6"
    >
      <input type="hidden" name="brandId" value={brandId} />
      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="file"
          name="file"
          required
          className="text-sm file:mr-3 file:rounded file:border-0 file:bg-stone-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-stone-800 file:cursor-pointer"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-stone-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
        >
          {isPending ? 'Uploading…' : 'Upload'}
        </button>
        <span className="text-xs text-stone-500">Max 25 MB.</span>
      </div>
      {state.error && (
        <div className="mt-3 text-sm text-red-700">{state.error}</div>
      )}
      {state.asset && (
        <div className="mt-3 text-sm text-emerald-700">
          Uploaded: <span className="font-mono">{state.asset.pathname.split('/').pop()}</span>
        </div>
      )}
    </form>
  );
}
