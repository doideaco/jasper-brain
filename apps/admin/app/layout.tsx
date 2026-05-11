import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { getCurrentUser } from '@/lib/auth';
import { MainWrap, TopNav } from '@/components/top-nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Signal — by Jasper',
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
          <TopNav role={user?.role ?? null} />
          <MainWrap>{children}</MainWrap>
        </body>
      </html>
    </ClerkProvider>
  );
}
