'use client';

import { useRef, useState } from 'react';
import {
  bulkCreateIllustrations,
  type BulkUploadResult,
} from '@/app/actions/illustrations';

const BATCH_BYTES_LIMIT = 3 * 1024 * 1024; // 3 MB per batch — stays under Vercel's 4.5MB POST cap.

interface Progress {
  totalFiles: number;
  uploadedFiles: number;
  createdItems: number;
  currentBatch: number;
  totalBatches: number;
  errors: string[];
}

function chunkBySize(files: File[], maxBytes: number): File[][] {
  const batches: File[][] = [];
  let current: File[] = [];
  let currentBytes = 0;
  for (const f of files) {
    // A single file bigger than the limit gets its own batch
    if (f.size > maxBytes) {
      if (current.length > 0) {
        batches.push(current);
        current = [];
        currentBytes = 0;
      }
      batches.push([f]);
      continue;
    }
    if (currentBytes + f.size > maxBytes && current.length > 0) {
      batches.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(f);
    currentBytes += f.size;
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

export function IllustrationBulkUpload({ brandId }: { brandId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileCount, setFileCount] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [done, setDone] = useState<BulkUploadResult | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileList = inputRef.current?.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const batches = chunkBySize(files, BATCH_BYTES_LIMIT);

    setIsPending(true);
    setDone(null);
    setProgress({
      totalFiles: files.length,
      uploadedFiles: 0,
      createdItems: 0,
      currentBatch: 0,
      totalBatches: batches.length,
      errors: [],
    });

    let uploaded = 0;
    let created = 0;
    const errors: string[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const fd = new FormData();
      fd.append('brandId', brandId);
      for (const f of batch) fd.append('files', f);

      try {
        const result = await bulkCreateIllustrations(null, fd);
        uploaded += result.uploaded ?? 0;
        created += result.itemsCreated ?? 0;
        if (result.errors) errors.push(...result.errors);
        if (!result.ok && !result.errors) {
          errors.push(`Batch ${i + 1}: ${result.message}`);
        }
      } catch (err) {
        errors.push(
          `Batch ${i + 1}: ${err instanceof Error ? err.message : 'failed'}`,
        );
      }

      setProgress({
        totalFiles: files.length,
        uploadedFiles: uploaded,
        createdItems: created,
        currentBatch: i + 1,
        totalBatches: batches.length,
        errors,
      });
    }

    setIsPending(false);
    setDone({
      ok: created > 0,
      message:
        created > 0
          ? `Uploaded ${uploaded} files and created ${created} illustration items across ${batches.length} batch${batches.length === 1 ? '' : 'es'}.`
          : 'No illustrations were created.',
      uploaded,
      itemsCreated: created,
      errors: errors.length > 0 ? errors : undefined,
    });

    // Reset the input so the user can pick a different folder.
    if (inputRef.current) inputRef.current.value = '';
    setFileCount(0);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-stone-800 mb-1.5 block">
            Pick files (or drop a folder)
          </span>
          <input
            ref={inputRef}
            type="file"
            name="files"
            multiple
            accept="image/webp,image/png,image/svg+xml,image/jpeg,image/gif"
            onChange={(e) => setFileCount(e.target.files?.length ?? 0)}
            disabled={isPending}
            className="block w-full text-sm text-stone-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-stone-900 file:text-white hover:file:bg-stone-800 file:cursor-pointer disabled:opacity-50"
          />
          {fileCount > 0 && !isPending && (
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
            ? `Uploading… (batch ${progress?.currentBatch ?? 0} / ${progress?.totalBatches ?? 0})`
            : `Upload & create items (${fileCount})`}
        </button>
      </form>

      <p className="text-xs text-stone-500 max-w-2xl">
        Files are uploaded in batches (each &lt; 3 MB) to stay under
        Vercel&apos;s serverless POST cap. Each file becomes its own
        Illustration item with the filename as the default name. Mood /
        subject / pairsWith are left blank — fill them in by hand on each
        item, or use the AI auto-tag button on the Illustrations list to
        do it in bulk.
      </p>

      {progress && isPending && (
        <div className="rounded border border-stone-300 bg-stone-50 px-4 py-3 text-sm">
          <div className="font-medium">
            Batch {progress.currentBatch} of {progress.totalBatches} ·{' '}
            {progress.createdItems} / {progress.totalFiles} items created
          </div>
          <div className="w-full h-1 bg-stone-200 rounded mt-2 overflow-hidden">
            <div
              className="h-full bg-stone-900 transition-all"
              style={{
                width: `${(progress.createdItems / progress.totalFiles) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {done && (
        <div
          className={`rounded border px-4 py-3 text-sm ${
            done.ok
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : 'border-red-300 bg-red-50 text-red-800'
          }`}
        >
          <div className="font-medium">{done.message}</div>
          {done.ok && (
            <div className="text-xs mt-1.5 text-emerald-700">
              {done.uploaded} uploaded, {done.itemsCreated} items created.
            </div>
          )}
          {done.errors && done.errors.length > 0 && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer">
                {done.errors.length} item-level errors
              </summary>
              <ul className="text-xs mt-1 space-y-0.5 font-mono max-h-64 overflow-y-auto">
                {done.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
