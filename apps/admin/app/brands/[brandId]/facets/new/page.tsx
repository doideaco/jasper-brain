import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GROUPS } from '@jasper-brain/core';
import { getStore } from '@/lib/store';
import { NewFacetForm } from '@/components/new-facet-form';

export const dynamic = 'force-dynamic';

type Params = { brandId: string };

export default async function NewFacetPage({
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

  const facets = await store.listFacets(brandId);
  const existingFacetIds = facets.map((f) => f.id);

  return (
    <div>
      <nav className="text-sm text-stone-500 mb-4">
        <Link href={`/brands/${brandId}`} className="hover:text-stone-800">
          ← Overview
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          New custom facet
        </h1>
        <p className="text-stone-600 mt-2 max-w-2xl">
          Define a new kind of context this brand needs. Items in this facet get
          a generic editor — markdown body plus arbitrary frontmatter — and
          surface in MCP alongside the built-in facets.
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_18rem] gap-8">
        <NewFacetForm
          brandId={brandId}
          groups={GROUPS.map((g) => ({ id: g.id, label: g.label }))}
          existingFacetIds={existingFacetIds}
        />

        <aside className="space-y-5">
          <BestResultsCard />
          <WhenToUseCard />
        </aside>
      </div>
    </div>
  );
}

function BestResultsCard() {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
      <h3 className="text-xs uppercase tracking-wide text-stone-500 font-semibold">
        For best results
      </h3>
      <ul className="text-sm text-stone-700 space-y-2.5">
        <li>
          <strong className="font-medium text-stone-900">Be specific.</strong>{' '}
          A facet should hold one kind of thing. "Compliance disclaimers" is
          better than "legal stuff."
        </li>
        <li>
          <strong className="font-medium text-stone-900">
            Pick the id carefully.
          </strong>{' '}
          It's permanent and shows up in URLs and MCP tool calls. Use the
          singular form: <code className="bg-stone-100 px-1 rounded">disclaimer</code>{' '}
          not <code className="bg-stone-100 px-1 rounded">disclaimers</code>.
        </li>
        <li>
          <strong className="font-medium text-stone-900">
            Write a clear description.
          </strong>{' '}
          AI tools see this when discovering facets. Tell them when and why
          they'd reach for items in this facet.
        </li>
        <li>
          <strong className="font-medium text-stone-900">Right group.</strong>{' '}
          Group placement is purely organisational — it controls where the
          facet shows up on the brand page sidebar. Pick the closest fit.
        </li>
      </ul>
    </section>
  );
}

function WhenToUseCard() {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
      <h3 className="text-xs uppercase tracking-wide text-stone-500 font-semibold">
        When to use a custom facet vs. existing
      </h3>
      <div className="text-sm text-stone-700 space-y-2.5">
        <p>
          Before adding custom, check whether a built-in facet covers it:
        </p>
        <ul className="space-y-1 text-xs text-stone-600">
          <li>
            • A new <em>rule</em>? Add a <strong>guideline</strong> or{' '}
            <strong>guardrail</strong>.
          </li>
          <li>
            • A new <em>fact</em>? Add a <strong>knowledge</strong> item.
          </li>
          <li>
            • A new <em>procedure</em>? Add a <strong>skill</strong>.
          </li>
          <li>
            • A new <em>structure</em>? Add a <strong>template</strong>.
          </li>
        </ul>
        <p className="pt-1">
          Custom facets earn their place when items genuinely don't fit any
          built-in shape — typically because they have unique structured data
          (e.g. a <em>case study</em> with customer + outcome + metric fields).
        </p>
      </div>
    </section>
  );
}
