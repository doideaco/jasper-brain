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
  let brand;
  try {
    brand = await (await getStore()).getBrand(brandId);
  } catch {
    notFound();
  }

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

      <NewFacetForm
        brandId={brandId}
        groups={GROUPS.map((g) => ({ id: g.id, label: g.label }))}
      />
    </div>
  );
}
