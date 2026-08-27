'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, UserRound } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import Monogram from '@/components/ui/Monogram';

export default function Header() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    toast.success('You have been logged out.');
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-30 bg-ivory/90 backdrop-blur border-b border-gold-light/30">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Monogram size={28} animated={false} />
          <span className="font-serif text-lg tracking-wide text-ink group-hover:text-gold-dark transition-colors">
            The Ashworth Club
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          {!isLoading && isAuthenticated && (
            <>
              <Link
                href="/profile"
                className="hidden sm:inline-flex items-center gap-2 font-sans text-[12px] tracking-widest2 uppercase text-ink/60 hover:text-gold-dark transition-colors"
              >
                <UserRound size={15} strokeWidth={1.5} />
                My Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 font-sans text-[12px] tracking-widest2 uppercase text-ink/60 hover:text-gold-dark transition-colors"
              >
                <LogOut size={15} strokeWidth={1.5} />
                Logout
              </button>
            </>
          )}

          {!isLoading && !isAuthenticated && (
            <Link
              href="/login"
              className="font-sans text-[12px] tracking-widest2 uppercase text-gold-dark hover:underline"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
