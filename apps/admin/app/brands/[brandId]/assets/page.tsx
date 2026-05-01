import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AssetRow } from '@/components/asset-row';
import { AssetUploader } from '@/components/asset-uploader';
import { blobBackend, listFiles } from '@/lib/blob';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Params = { brandId: string };

export default async function AssetsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { brandId } = await params;

  try {
    await (await getStore()).getBrand(brandId);
  } catch {
    notFound();
  }

  const assets = await listFiles(brandId);
  const backend = blobBackend();

  return (
    <div>
      <nav className="text-sm text-stone-500 mb-4">
        <Link href={`/brands/${brandId}`} className="hover:text-stone-800">
          ← Overview
        </Link>
      </nav>

      <header className="mb-6">
        <div className="text-xs uppercase tracking-wide text-stone-400 mb-1">
          Assets
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Brand assets</h1>
        <p className="text-stone-600 mt-2 max-w-2xl">
          Upload logos, fonts, and images. Copy the URL into Logo, Typography, or
          Person items — anywhere a public file URL is expected.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-xs text-stone-500">
          <span className="font-mono bg-stone-100 px-2 py-0.5 rounded">
            backend: {backend}
          </span>
          {backend === 'local-fs' && (
            <span>
              — set <code>BLOB_READ_WRITE_TOKEN</code> to use Vercel Blob.
            </span>
          )}
        </div>
      </header>

      <div className="mb-8">
        <AssetUploader brandId={brandId} />
      </div>

      <section>
        <header className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
            Uploaded
          </h2>
          <span className="text-xs text-stone-400 font-mono">{assets.length}</span>
        </header>
        {assets.length === 0 ? (
          <div className="rounded border border-dashed border-stone-300 p-8 text-center text-stone-500 text-sm">
            No uploads yet.
          </div>
        ) : (
          <ul className="rounded-lg border border-stone-200 bg-white divide-y divide-stone-100">
            {assets.map((asset) => (
              <AssetRow key={asset.pathname} brandId={brandId} asset={asset} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
