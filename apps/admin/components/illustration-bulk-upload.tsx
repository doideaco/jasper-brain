'use client';

import { upload } from '@vercel/blob/client';
import { useRef, useState } from 'react';

interface FileStatus {
  name: string;
  status: 'queued' | 'uploading' | 'done' | 'error';
  error?: string;
}

const MAX_CONCURRENT = 4;
const SUPPORTED_FORMATS = new Set([
  'webp',
  'png',
  'svg',
  'jpg',
  'jpeg',
  'gif',
]);

function formatFromExt(name: string): string | null {
  const ext = name.split('.').pop()?.toLowerCase();
  if (!ext) return null;
  return SUPPORTED_FORMATS.has(ext) ? ext : null;
}

function safeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

export function IllustrationBulkUpload({ brandId }: { brandId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [statuses, setStatuses] = useState<FileStatus[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [done, setDone] = useState<{ ok: number; err: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const list = inputRef.current?.files;
    if (!list || list.length === 0) return;

    const files = Array.from(list);
    setIsPending(true);
    setDone(null);
    setStatuses(
      files.map((f) => ({
        name: f.name,
        status: 'queued',
      })),
    );

    let okCount = 0;
    let errCount = 0;

    // Bounded-concurrency pool: at most MAX_CONCURRENT uploads in flight.
    let cursor = 0;
    const updateStatus = (i: number, patch: Partial<FileStatus>) =>
      setStatuses((prev) => {
        const next = prev.slice();
        next[i] = { ...next[i], ...patch };
        return next;
      });

    async function worker() {
      while (true) {
        const i = cursor++;
        if (i >= files.length) return;
        const file = files[i];
        const format = formatFromExt(file.name);
        if (!format) {
          errCount += 1;
          updateStatus(i, { status: 'error', error: 'unsupported format' });
          continue;
        }

        updateStatus(i, { status: 'uploading' });
        try {
          const safe = safeFileName(file.name);
          await upload(`brands/${brandId}/uploads/${safe}`, file, {
            access: 'public',
            handleUploadUrl: '/api/blob-upload-token',
            clientPayload: JSON.stringify({
              brandId,
              fileName: file.name,
              format,
            }),
          });
          okCount += 1;
          updateStatus(i, { status: 'done' });
        } catch (err) {
          errCount += 1;
          updateStatus(i, {
            status: 'error',
            error: err instanceof Error ? err.message : 'upload failed',
          });
        }
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(MAX_CONCURRENT, files.length) }, () =>
        worker(),
      ),
    );

    setIsPending(false);
    setDone({ ok: okCount, err: errCount });
    if (inputRef.current) inputRef.current.value = '';
  };

  const totalCount = statuses.length;
  const doneCount = statuses.filter(
    (s) => s.status === 'done' || s.status === 'error',
  ).length;

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
            multiple
            accept="image/webp,image/png,image/svg+xml,image/jpeg,image/gif"
            disabled={isPending}
            onChange={() => {
              setStatuses([]);
              setDone(null);
            }}
            className="block w-full text-sm text-stone-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-stone-900 file:text-white hover:file:bg-stone-800 file:cursor-pointer disabled:opacity-50"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
        >
          {isPending ? `Uploading ${doneCount} / ${totalCount}…` : `Upload`}
        </button>
      </form>

      <p className="text-xs text-stone-500 max-w-2xl">
        Files upload directly from your browser to Vercel Blob (bypassing the
        function POST cap). Each one becomes its own Illustration item with the
        filename as the default name. Mood / subject / pairsWith are left blank
        — fill them in by hand on each item, or use the AI auto-tag button on
        the Illustrations list to do it in bulk.
      </p>

      {totalCount > 0 && (
        <div className="rounded border border-stone-200 bg-white">
          <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
            <div className="font-medium text-sm">
              {doneCount} / {totalCount} processed
            </div>
            {done && (
              <div className="text-xs text-stone-500">
                {done.ok} succeeded · {done.err} failed
              </div>
            )}
          </div>
          <ul className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
            {statuses.map((s, i) => (
              <li
                key={`${s.name}-${i}`}
                className="px-4 py-2 flex items-center justify-between text-xs gap-3"
              >
                <span className="font-mono truncate flex-1" title={s.name}>
                  {s.name}
                </span>
                <span
                  className={`shrink-0 ${
                    s.status === 'done'
                      ? 'text-emerald-700'
                      : s.status === 'error'
                      ? 'text-red-700'
                      : s.status === 'uploading'
                      ? 'text-stone-700'
                      : 'text-stone-400'
                  }`}
                >
                  {s.status === 'done'
                    ? '✓ uploaded'
                    : s.status === 'error'
                    ? `✗ ${s.error ?? 'failed'}`
                    : s.status === 'uploading'
                    ? 'uploading…'
                    : 'queued'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {done && !isPending && (
        <div
          className={`rounded border px-4 py-3 text-sm ${
            done.err === 0
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : 'border-amber-300 bg-amber-50 text-amber-900'
          }`}
        >
          <div className="font-medium">
            {done.err === 0
              ? `Uploaded ${done.ok} files. Item creation runs in the background — refresh the Illustrations list in a few seconds.`
              : `Uploaded ${done.ok} of ${done.ok + done.err} files. ${done.err} failed — see the list above.`}
          </div>
        </div>
      )}
    </div>
  );
}
