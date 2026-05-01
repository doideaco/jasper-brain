import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { FacetDefinition } from '@jasper-brain/core';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Params = { brandId: string };
type SearchParams = { q?: string };

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { brandId } = await params;
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const store = await getStore();

  try {
    await store.getBrand(brandId);
  } catch {
    notFound();
  }

  const facets = await store.listFacets(brandId);
  const facetById = new Map<string, FacetDefinition>();
  for (const f of facets) facetById.set(f.id, f);

  const results = query ? await store.search(brandId, query, { limit: 50 }) : [];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <form
          action={`/brands/${brandId}/search`}
          method="get"
          className="mt-4"
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search across every facet…"
            autoFocus
            className="w-full rounded border border-stone-300 bg-white px-3 py-2 text-base placeholder:text-stone-400 focus:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-700"
          />
        </form>
      </header>

      {!query ? (
        <p className="text-sm text-stone-500">
          Type to search across voices, guidelines, skills, templates, knowledge,
          guardrails, products, people, values, typography, palettes, logos, and
          custom facets — body, name, description, and tags.
        </p>
      ) : results.length === 0 ? (
        <div className="rounded border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
          No matches for{' '}
          <code className="bg-stone-100 px-1.5 py-0.5 rounded">{query}</code>.
        </div>
      ) : (
        <div>
          <div className="text-sm text-stone-500 mb-3">
            {results.length} result{results.length === 1 ? '' : 's'} for{' '}
            <code className="bg-stone-100 px-1.5 py-0.5 rounded">{query}</code>
          </div>
          <ul className="rounded-lg border border-stone-200 bg-white divide-y divide-stone-100">
            {results.map((item) => {
              const fid = item.type === 'custom' ? item.facetId : item.type;
              const facet = facetById.get(fid);
              return (
                <li key={`${fid}/${item.id}`}>
                  <Link
                    href={`/brands/${brandId}/${fid}/${item.id}`}
                    className="grid grid-cols-[8rem_1fr_auto] items-baseline gap-4 px-5 py-3 hover:bg-stone-50"
                  >
                    <span className="text-xs uppercase tracking-wide text-stone-500 truncate">
                      {facet?.label ?? fid}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-stone-500 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 font-mono shrink-0">
                      {item.id}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
