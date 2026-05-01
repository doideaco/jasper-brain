import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArtifactForm } from '@/components/artifact-form';
import { AssetPicker } from '@/components/asset-picker';
import { listFiles } from '@/lib/blob';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

const ASSET_FACETS = new Set(['logo', 'typography', 'person']);

type Params = { brandId: string; type: string; artifactId: string };

export default async function EditArtifactPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { brandId, type, artifactId } = await params;
  const facetId = type;
  const store = await getStore();

  let brand, facet, artifact;
  try {
    brand = await store.getBrand(brandId);
    const facets = await store.listFacets(brandId);
    facet = facets.find((f) => f.id === facetId);
    if (!facet) notFound();
    artifact = await store.getArtifact(brandId, facetId, artifactId);
  } catch {
    notFound();
  }

  const showAssetPicker = ASSET_FACETS.has(facetId);
  const assets = showAssetPicker ? await listFiles(brandId) : [];

  return (
    <div>
      <nav className="text-sm text-stone-500 mb-4">
        <Link
          href={`/brands/${brandId}/${facetId}/${artifactId}`}
          className="hover:text-stone-800"
        >
          ← {artifact.name}
        </Link>
      </nav>

      <header className="mb-8">
        <div className="text-xs uppercase tracking-wide text-stone-400 mb-1">
          Editing {facet.label}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{artifact.name}</h1>
      </header>

      <div className="grid lg:grid-cols-[1fr_18rem] gap-8">
        <ArtifactForm
          brandId={brandId}
          facet={facet}
          artifact={artifact}
          uploadedAssets={assets}
        />
        {showAssetPicker && (
          <aside className="space-y-3">
            <h3 className="text-xs uppercase tracking-wide text-stone-500 font-semibold">
              Uploaded assets
            </h3>
            <p className="text-xs text-stone-500">
              Available below for inline pickers. Use <strong>Copy URL</strong>{' '}
              if you need to paste into a YAML field.
            </p>
            <AssetPicker brandId={brandId} assets={assets} />
          </aside>
        )}
      </div>
    </div>
  );
}
