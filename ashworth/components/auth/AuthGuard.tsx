'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirect = encodeURIComponent(pathname || '/');
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <main className="bg-white min-h-[60vh] flex items-center justify-center px-6 py-24">
        <p className="font-sans text-sm text-ink/50">Checking your session…</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    // Redirect is in flight — render nothing to avoid a flash of protected content.
    return null;
  }

  return <>{children}</>;
}
