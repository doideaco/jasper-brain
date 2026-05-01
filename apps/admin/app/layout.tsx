import type { Metadata } from 'next';
import Link from 'next/link';
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { getCurrentUser } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'Brain — by Jasper',
  description: 'Centralised brand knowledge and context layer.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen flex flex-col">
          <header className="border-b border-stone-200 bg-white">
            <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
              <Link href="/" className="font-semibold tracking-tight text-lg">
                Brain
                <span className="text-stone-400 font-normal text-sm ml-2">by Jasper</span>
              </Link>
              <div className="flex items-center gap-4 text-sm">
                <SignedIn>
                  <Link href="/brands" className="text-stone-600 hover:text-stone-900">
                    Brands
                  </Link>
                  {user && (
                    <span
                      className="text-[10px] uppercase tracking-wider bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-medium"
                      title={
                        user.role === 'admin'
                          ? 'Admin — can perform destructive actions.'
                          : 'Editor — can create and edit, but not delete.'
                      }
                    >
                      {user.role}
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
          <main className="flex-1 mx-auto max-w-6xl w-full px-6 py-10">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
