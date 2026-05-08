import Link from 'next/link';
import { ImportButton } from '@/components/import-button';
import { getStore, getStoreBackend } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function ImportPage() {
  await getStore();
  const backend = getStoreBackend();

  return (
    <div>
      <nav className="text-sm text-stone-500 mb-4">
        <Link href="/brands" className="hover:text-stone-800">
          ← Brands
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Import filesystem brands
        </h1>
        <p className="text-stone-600 mt-2 max-w-2xl">
          Walks the local <code>brands/</code> directory and writes brand
          profiles, items across all facets, and custom facet definitions
          into the active store. Pick a mode below — <strong>add-only</strong>{' '}
          is the safe default for grabbing new items added in code without
          touching your hand-edited records.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-xs text-stone-500">
          <span>active store:</span>
          <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded">
            {backend ?? 'unknown'}
          </span>
        </div>
      </header>

      {backend === 'postgres' ? (
        <ImportButton />
      ) : (
        <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Active store is filesystem — there's no separate target to import
          into. Set <code>DATABASE_URL</code> to enable Postgres, then come
          back here.
        </div>
      )}

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-2">
          What gets imported
        </h2>
        <ul className="text-sm text-stone-700 space-y-1.5 list-disc pl-5">
          <li>Every brand directory in <code>brands/</code> (brand.yaml).</li>
          <li>Every item across all built-in facets (voices, guidelines, skills, etc).</li>
          <li>Custom facet definitions from each brand's <code>facets.yaml</code>.</li>
        </ul>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-2 mt-6">
          What does NOT get imported
        </h2>
        <ul className="text-sm text-stone-700 space-y-1.5 list-disc pl-5">
          <li>
            Uploaded asset files (the <code>uploads/</code> directories) — those
            need to be re-uploaded to Vercel Blob via the Assets page.
          </li>
        </ul>
      </section>
    </div>
  );
}
