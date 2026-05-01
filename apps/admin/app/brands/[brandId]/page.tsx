import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Brand, FacetDefinition } from '@jasper-brain/core';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Params = { brandId: string };

export default async function BrandOverviewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { brandId } = await params;
  const store = await getStore();

  let brand;
  try {
    brand = await store.getBrand(brandId);
  } catch {
    notFound();
  }

  const [facets, items] = await Promise.all([
    store.listFacets(brandId),
    store.listArtifacts(brandId),
  ]);

  const facetById = new Map<string, FacetDefinition>();
  for (const f of facets) facetById.set(f.id, f);

  const customCount = facets.filter((f) => !f.builtIn).length;

  return (
    <div>
      <header className="mb-10 flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold tracking-tight">{brand.name}</h1>
          {brand.tagline && (
            <p className="text-stone-700 italic mt-1">{brand.tagline}</p>
          )}
          {brand.description && (
            <p className="text-stone-600 mt-2 max-w-2xl">{brand.description}</p>
          )}
          {brand.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {brand.tags.map((t) => (
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
        <Link
          href={`/brands/${brandId}/edit`}
          className="text-sm font-medium text-stone-700 hover:text-stone-900 shrink-0"
        >
          Edit profile
        </Link>
      </header>

      <CanonicalInfo brand={brand} />

      <div className="grid grid-cols-3 gap-4 mb-12">
        <Stat label="Facets" value={facets.length} />
        <Stat label="Items" value={items.length} />
        <Stat
          label="Custom facets"
          value={customCount}
          hint={customCount === 0 ? 'None yet' : undefined}
        />
      </div>

      <section>
        <header className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
            All items
          </h2>
          <span className="text-xs text-stone-400 font-mono">{items.length}</span>
        </header>
        {items.length === 0 ? (
          <div className="rounded border border-dashed border-stone-300 p-8 text-center text-stone-500">
            No items yet. Pick a facet from the sidebar to add one.
          </div>
        ) : (
          <ul className="rounded-lg border border-stone-200 bg-white divide-y divide-stone-100">
            {items
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((item) => {
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
        )}
      </section>
    </div>
  );
}

function CanonicalInfo({ brand }: { brand: Brand }) {
  const hasMission = !!brand.mission;
  const hasVision = !!brand.vision;
  const hasFacts =
    !!brand.primaryUrl ||
    !!brand.founded ||
    !!brand.hq ||
    Object.keys(brand.urls ?? {}).length > 0 ||
    !!brand.contact;

  if (!hasMission && !hasVision && !hasFacts) {
    return (
      <div className="mb-12 rounded border border-dashed border-stone-300 p-6">
        <p className="text-sm text-stone-600">
          No canonical info yet. Brand basics — primary URL, mission, founded,
          HQ, contact — make every MCP-driven authoring session sharper.{' '}
          <Link
            href={`/brands/${brand.id}/edit`}
            className="text-stone-800 underline hover:text-stone-900"
          >
            Add brand profile →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mb-12 grid gap-4 md:grid-cols-2">
      {(hasMission || hasVision) && (
        <div className="rounded-lg border border-stone-200 bg-white p-5 space-y-4">
          {brand.mission && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-stone-500 font-semibold">
                Mission
              </h3>
              <p className="text-stone-700 mt-1">{brand.mission}</p>
            </div>
          )}
          {brand.vision && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-stone-500 font-semibold">
                Vision
              </h3>
              <p className="text-stone-700 mt-1">{brand.vision}</p>
            </div>
          )}
        </div>
      )}
      {hasFacts && (
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h3 className="text-xs uppercase tracking-wide text-stone-500 font-semibold mb-3">
            Facts
          </h3>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-sm">
            {brand.primaryUrl && (
              <Fact label="Web">
                <a
                  href={brand.primaryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-stone-900 break-all"
                >
                  {brand.primaryUrl}
                </a>
              </Fact>
            )}
            {brand.founded && <Fact label="Founded">{brand.founded}</Fact>}
            {brand.hq && (
              <Fact label="HQ">
                {[brand.hq.city, brand.hq.region, brand.hq.country]
                  .filter(Boolean)
                  .join(', ')}
              </Fact>
            )}
            {Object.entries(brand.urls ?? {}).map(([k, v]) => (
              <Fact key={k} label={k}>
                <a
                  href={v}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-stone-900 break-all"
                >
                  {v}
                </a>
              </Fact>
            ))}
            {brand.contact?.email && (
              <Fact label="Email">
                <a
                  href={`mailto:${brand.contact.email}`}
                  className="underline hover:text-stone-900"
                >
                  {brand.contact.email}
                </a>
              </Fact>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-stone-500 capitalize">{label}</dt>
      <dd className="text-stone-800 min-w-0">{children}</dd>
    </>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-5 py-4">
      <div className="text-xs uppercase tracking-wide text-stone-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {hint && <span className="text-xs text-stone-400">{hint}</span>}
      </div>
    </div>
  );
}
