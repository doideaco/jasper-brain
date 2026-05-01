import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArtifactForm } from '@/components/artifact-form';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Params = { brandId: string; type: string };

export default async function NewArtifactPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { brandId, type } = await params;
  const facetId = type;
  const store = await getStore();

  let brand, facet;
  try {
    brand = await store.getBrand(brandId);
    const facets = await store.listFacets(brandId);
    facet = facets.find((f) => f.id === facetId);
    if (!facet) notFound();
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
        <h1 className="text-2xl font-semibold tracking-tight">
          New {facet.label.toLowerCase()}
        </h1>
        {facet.blurb && (
          <p className="text-stone-600 mt-2 max-w-2xl">{facet.blurb}</p>
        )}
      </header>

      <ArtifactForm brandId={brandId} facet={facet} />
    </div>
  );
}
