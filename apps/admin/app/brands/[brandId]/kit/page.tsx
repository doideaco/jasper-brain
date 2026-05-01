import { notFound } from 'next/navigation';
import { getBrandKit } from '@jasper-brain/core';
import { BrandKitView } from '@/components/brand-kit-view';
import { KitToggle } from '@/components/kit-toggle';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Params = { brandId: string };

export default async function KitPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { brandId } = await params;
  const store = await getStore();

  let kit;
  try {
    kit = await getBrandKit(store, brandId);
  } catch {
    notFound();
  }

  const json = JSON.stringify(kit, null, 2);

  return (
    <div>
      <header className="mb-6">
        <div className="text-xs uppercase tracking-wide text-stone-400 mb-1">
          Brand kit
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {kit.brand.name}
        </h1>
        <p className="text-stone-600 mt-2 max-w-2xl">
          Exactly what an AI tool sees when it calls{' '}
          <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs">
            brain_get_brand_kit
          </code>{' '}
          over MCP. The visual view shows it the way you'd review it; the JSON
          view is the literal payload — copy and paste into a prompt to test.
        </p>
      </header>

      <KitToggle
        visual={<BrandKitView kit={kit} />}
        json={json}
      />
    </div>
  );
}
