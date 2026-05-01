import { notFound } from 'next/navigation';
import { GROUPS } from '@jasper-brain/core';
import { BrandSidebar, type SidebarGroup } from '@/components/brand-sidebar';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brandId: string }>;
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
  const items = await store.listArtifacts(brandId);

  const counts = new Map<string, number>();
  for (const item of items) {
    const fid = item.type === 'custom' ? item.facetId : item.type;
    counts.set(fid, (counts.get(fid) ?? 0) + 1);
  }

  const groups: SidebarGroup[] = GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    facets: facets
      .filter((f) => f.group === group.id)
      .map((f) => ({
        id: f.id,
        label: f.label,
        pluralLabel: f.pluralLabel,
        count: counts.get(f.id) ?? 0,
        builtIn: f.builtIn,
      })),
  })).filter((g) => g.facets.length > 0);

  return (
    <div className="flex gap-10 -mt-2">
      <BrandSidebar
        brandId={brandId}
        brandName={brand.name}
        brandDescription={brand.description}
        groups={groups}
      />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
