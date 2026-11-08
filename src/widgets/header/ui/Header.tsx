'use client';

import { useUserStore } from '@/entities/user';
import { AuthModal } from '@/features/auth';
import { useFavoritesSync } from '@/features/favorite-meal';
import { LanguageSwitcher } from '@/features/language-switcher';
import { Link } from '@/shared/config/i18n';
import { Heart, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Header = () => {
  const { syncWithCloud } = useFavoritesSync();

  const user = useUserStore((state) => state.user);
  const initAuth = useUserStore((state) => state.initAuth);
  const signOut = useUserStore((state) => state.signOut);

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md transition-colors print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
          >
            TheMealApp
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/favorites"
              className="group flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <span className="hidden sm:inline">Favorites</span>
              <Heart className="size-4.5 text-red-500 fill-none group-hover:fill-red-500 group-hover:scale-130 transition-all duration-200" />
            </Link>

            <LanguageSwitcher />

            <div className="h-4 w-px bg-border mx-1" />

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 text-xs font-medium text-foreground">
                  <UserIcon className="size-3.5 text-primary" />
                  <span className="max-w-[140px] truncate">{user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              >
                <LogIn className="size-4" />
                <span>Sign In</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => void syncWithCloud()}
      />
    </>
  );
};
