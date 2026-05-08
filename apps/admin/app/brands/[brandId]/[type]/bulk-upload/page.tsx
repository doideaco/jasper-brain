import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IllustrationBulkUpload } from '@/components/illustration-bulk-upload';

export const dynamic = 'force-dynamic';

type Params = { brandId: string; type: string };

export default async function BulkUploadPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { brandId, type } = await params;

  // Bulk-upload is only meaningful for illustrations today. Other facets
  // can opt in later (logos, textures, etc.) by widening this gate.
  if (type !== 'illustration') notFound();

  return (
    <div>
      <nav className="text-sm text-stone-500 mb-4">
        <Link
          href={`/brands/${brandId}/${type}`}
          className="hover:text-stone-800"
        >
          ← Illustrations
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Bulk upload illustrations
        </h1>
        <p className="text-stone-600 mt-2 max-w-2xl">
          Drag a folder or pick multiple files. Each one becomes its own
          Illustration item — tag them later (or use the AI auto-tag button
          on the list page).
        </p>
      </header>

      <IllustrationBulkUpload brandId={brandId} />
    </div>
  );
}
