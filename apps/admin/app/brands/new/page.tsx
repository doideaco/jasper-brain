import Link from 'next/link';
import { NewBrandForm } from '@/components/new-brand-form';

export const dynamic = 'force-dynamic';

export default function NewBrandPage() {
  return (
    <div>
      <nav className="text-sm text-stone-500 mb-4">
        <Link href="/brands" className="hover:text-stone-800">
          ← Brands
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">New brand</h1>
        <p className="text-stone-600 mt-2 max-w-2xl">
          Just the basics to start. After this, you'll land on the brand profile
          to fill in mission, URLs, contact, and visual identity.
        </p>
      </header>

      <NewBrandForm />
    </div>
  );
}
