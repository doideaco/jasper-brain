'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function TopNav({
  role,
}: {
  role: 'admin' | 'editor' | null;
}) {
  const pathname = usePathname();

  // Public-share pages are full-bleed brand surfaces — no admin chrome.
  if (pathname?.startsWith('/share/')) return null;

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/signal-logo.svg?v=1"
            alt="Signal"
            className="h-5 w-auto group-hover:opacity-80 transition-opacity"
          />
          <span className="text-stone-400 font-normal text-sm leading-none">
            by Jasper
          </span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <SignedIn>
            <Link href="/brands" className="text-stone-600 hover:text-stone-900">
              Brands
            </Link>
            {role && (
              <span
                className="text-[10px] uppercase tracking-wider bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-medium"
                title={
                  role === 'admin'
                    ? 'Admin — can perform destructive actions.'
                    : 'Editor — can create and edit, but not delete.'
                }
              >
                {role}
              </span>
            )}
            <UserButton appearance={{ elements: { avatarBox: 'h-7 w-7' } }} />
          </SignedIn>
          <SignedOut>
            <Link
              href="/sign-in"
              className="text-stone-600 hover:text-stone-900"
            >
              Sign in
            </Link>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}

/** Wraps the main content with admin padding, except on /share/* where the page renders full-bleed. */
export function MainWrap({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/share/')) {
    return <main className="flex-1 w-full">{children}</main>;
  }
  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-6 py-10">{children}</main>
  );
}
