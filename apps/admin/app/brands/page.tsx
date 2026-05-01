import Link from 'next/link';
import { getStore, getStoreBackend } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function BrandsPage() {
  const store = await getStore();
  const brands = await store.listBrands();
  const backend = getStoreBackend();

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Brands</h1>
          <p className="text-stone-600 mt-1">
            Each brand is a self-contained Brain — voice, visual identity,
            knowledge, rules, and plays.
          </p>
          {backend && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-stone-500">
              <span>store:</span>
              <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded">
                {backend}
              </span>
              {backend === 'postgres' && (
                <Link
                  href="/brands/import"
                  className="ml-2 underline hover:text-stone-800"
                >
                  Import from filesystem →
                </Link>
              )}
            </div>
          )}
        </div>
        <Link
          href="/brands/new"
          className="rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 shrink-0"
        >
          + New brand
        </Link>
      </div>

      {brands.length === 0 ? (
        <div className="rounded border border-dashed border-stone-300 p-8 text-center text-stone-500">
          No brands yet. Drop a brand directory into <code>brands/</code> to get
          started.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {brands.map((b) => (
            <li key={b.id}>
              <Link
                href={`/brands/${b.id}`}
                className="block rounded-lg border border-stone-200 bg-white p-5 hover:border-stone-400 transition-colors"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <h2 className="font-semibold">{b.name}</h2>
                  <span className="text-xs text-stone-400 font-mono">{b.id}</span>
                </div>
                {b.description && (
                  <p className="text-sm text-stone-600 line-clamp-2">{b.description}</p>
                )}
                {b.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {b.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
