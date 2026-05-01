import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Params = { brandId: string; type: string };

export default async function FacetListPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { brandId, type } = await params;
  const facetId = type;
  const store = await getStore();

  const facets = await store.listFacets(brandId);
  const facet = facets.find((f) => f.id === facetId);
  if (!facet) notFound();

  const items = await store.listArtifacts(brandId, { facetId });

  return (
    <div>
      <header className="mb-8 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-wide text-stone-400 mb-1 flex items-center gap-2">
            {facet.label}
            {!facet.builtIn && (
              <span className="text-[10px] tracking-wider bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                custom
              </span>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {facet.pluralLabel}
          </h1>
          {facet.blurb && (
            <p className="text-stone-600 mt-2 max-w-2xl">{facet.blurb}</p>
          )}
        </div>
        <Link
          href={`/brands/${brandId}/${facetId}/new`}
          className="rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 shrink-0"
        >
          + New {facet.label.toLowerCase()}
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="rounded border border-dashed border-stone-300 p-12 text-center">
          <p className="text-stone-600 font-medium">
            No {facet.pluralLabel.toLowerCase()} yet.
          </p>
          <p className="text-sm text-stone-500 mt-1">
            <Link
              href={`/brands/${brandId}/${facetId}/new`}
              className="text-stone-700 underline hover:text-stone-900"
            >
              Create the first one
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="rounded-lg border border-stone-200 bg-white divide-y divide-stone-100">
          {items
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item) => (
              <li key={item.id}>
                <Link
                  href={`/brands/${brandId}/${facetId}/${item.id}`}
                  className="block px-5 py-4 hover:bg-stone-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-stone-500 mt-0.5 line-clamp-2">
                          {item.description}
                        </div>
                      )}
                      {item.tags?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 font-mono shrink-0">
                      {item.id}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
