import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BrandForm } from '@/components/brand-form';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Params = { brandId: string };

export default async function EditBrandPage({
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
        <div className="text-xs uppercase tracking-wide text-stone-400 mb-1">
          Brand profile
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit {brand.name}
        </h1>
        <p className="text-stone-600 mt-2 max-w-2xl">
          Canonical brand info — exposed to every AI tool through MCP via{' '}
          <code className="bg-stone-100 px-1 py-0.5 rounded text-xs">
            brain_get_brand
          </code>
          . Fill these in once, then every tool authoring on-brand content has
          the basics.
        </p>
      </header>

      <BrandForm brand={brand} />
    </div>
  );
}
