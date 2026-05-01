'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarSearch } from './sidebar-search';

export interface SidebarFacet {
  id: string;
  label: string;
  pluralLabel: string;
  count: number;
  builtIn: boolean;
}

export interface SidebarGroup {
  id: string;
  label: string;
  facets: SidebarFacet[];
}

export function BrandSidebar({
  brandId,
  brandName,
  brandDescription,
  groups,
}: {
  brandId: string;
  brandName: string;
  brandDescription?: string;
  groups: SidebarGroup[];
}) {
  const pathname = usePathname();
  const brandHome = `/brands/${brandId}`;
  const isHome = pathname === brandHome;
  const isFacetsNew = pathname.startsWith(`${brandHome}/facets`);
  const isAssets = pathname.startsWith(`${brandHome}/assets`);
  const isKit = pathname.startsWith(`${brandHome}/kit`);

  return (
    <aside className="w-60 shrink-0">
      <div className="sticky top-6">
        <Link href={brandHome} className="block mb-6 group">
          <div
            className={`text-base ${
              isHome
                ? 'font-semibold text-stone-900'
                : 'font-medium text-stone-800 group-hover:text-stone-900'
            }`}
          >
            {brandName}
          </div>
          {brandDescription && (
            <div className="text-xs text-stone-500 mt-0.5 line-clamp-2">
              {brandDescription}
            </div>
          )}
        </Link>

        <SidebarSearch brandId={brandId} />

        <nav className="space-y-5">
          {groups.map((group) => (
            <div key={group.id}>
              <h3 className="text-[10px] uppercase tracking-[0.08em] text-stone-400 font-semibold mb-1.5 px-2">
                {group.label}
              </h3>
              <ul className="space-y-0.5">
                {group.facets.map((facet) => {
                  const href = `${brandHome}/${facet.id}`;
                  const isActive =
                    pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <li key={facet.id}>
                      <Link
                        href={href}
                        className={`group flex items-baseline justify-between px-2 py-1 rounded text-sm transition-colors ${
                          isActive
                            ? 'bg-stone-900 text-white font-medium'
                            : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className="flex items-baseline gap-1.5 min-w-0">
                          <span className="truncate">{facet.pluralLabel}</span>
                          {!facet.builtIn && (
                            <span
                              className={`text-[9px] uppercase tracking-wider px-1 py-0.5 rounded ${
                                isActive
                                  ? 'bg-stone-700 text-stone-200'
                                  : 'bg-stone-100 text-stone-500 group-hover:bg-stone-200'
                              }`}
                            >
                              custom
                            </span>
                          )}
                        </span>
                        <span
                          className={`text-xs font-mono shrink-0 tabular-nums ${
                            isActive ? 'text-stone-300' : 'text-stone-400'
                          }`}
                        >
                          {facet.count}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-8 pt-5 border-t border-stone-200 space-y-1">
          <Link
            href={`${brandHome}/kit`}
            className={`block px-2 py-1 rounded text-sm transition-colors ${
              isKit
                ? 'bg-stone-100 text-stone-900 font-medium'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Brand kit
          </Link>
          <Link
            href={`${brandHome}/assets`}
            className={`block px-2 py-1 rounded text-sm transition-colors ${
              isAssets
                ? 'bg-stone-100 text-stone-900 font-medium'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Assets
          </Link>
          <Link
            href={`${brandHome}/facets/new`}
            className={`block px-2 py-1 rounded text-sm transition-colors ${
              isFacetsNew
                ? 'bg-stone-100 text-stone-900 font-medium'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            + Add custom facet
          </Link>
        </div>
      </div>
    </aside>
  );
}
