'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function SidebarSearch({ brandId }: { brandId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(
      `/brands/${brandId}/search?q=${encodeURIComponent(trimmed)}`,
    );
  };

  return (
    <form onSubmit={onSubmit} className="mb-6">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search items…"
        className="w-full rounded border border-stone-300 bg-white px-2.5 py-1.5 text-sm placeholder:text-stone-400 focus:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-700"
      />
    </form>
  );
}
