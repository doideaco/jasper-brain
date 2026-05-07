import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlaygroundForm } from '@/components/playground-form';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Params = { brandId: string };

export default async function PlaygroundPage({
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
      <header className="mb-6 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-wide text-stone-400 mb-1">
            Playground
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Generate with {brand.name}'s brand context
          </h1>
          <p className="text-stone-600 mt-2 max-w-2xl">
            A live MCP-grounded scratchpad. Type a request, the system pulls
            the full brand kit, sends it to the model with the voice and
            guardrails, and returns on-brand output. The right column shows
            the exact JSON the AI received.
          </p>
        </div>
        <Link
          href={`/brands/${brandId}/kit`}
          className="text-sm text-stone-600 hover:text-stone-900 shrink-0"
        >
          See full kit →
        </Link>
      </header>

      <PlaygroundForm brandId={brandId} />
    </div>
  );
}
