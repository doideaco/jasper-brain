import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStore } from '@/lib/store';
import { DeleteButton } from '@/components/delete-button';
import { ArtifactView } from './artifact-view';

export const dynamic = 'force-dynamic';

type Params = { brandId: string; type: string; artifactId: string };

export default async function ArtifactPage({
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

  return (
    <div>
      <nav className="text-sm text-stone-500 mb-4">
        <Link
          href={`/brands/${brandId}/${facetId}`}
          className="hover:text-stone-800"
        >
          ← {facet.pluralLabel}
        </Link>
      </nav>

      <header className="mb-8">
        <div className="text-xs uppercase tracking-wide text-stone-400 mb-1">
          {facet.label}
          {!facet.builtIn && (
            <span className="ml-2 text-[10px] tracking-wider bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
              custom
            </span>
          )}
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{artifact.name}</h1>
            {artifact.description && (
              <p className="text-stone-600 mt-2 max-w-2xl">{artifact.description}</p>
            )}
            {artifact.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {artifact.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-sm text-stone-400 font-mono">{artifact.id}</span>
            <div className="flex items-center gap-3 mt-1">
              <Link
                href={`/brands/${brandId}/${facetId}/${artifact.id}/edit`}
                className="text-sm font-medium text-stone-700 hover:text-stone-900"
              >
                Edit
              </Link>
              <DeleteButton
                brandId={brandId}
                facetId={facetId}
                id={artifact.id}
                label={artifact.name}
              />
            </div>
          </div>
        </div>
      </header>

      <ArtifactView artifact={artifact} />
    </div>
  );
}
