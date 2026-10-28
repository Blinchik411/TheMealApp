'use client';

import { useUserStore } from '@/entities/user';
import { AuthModal } from '@/features/auth';
import { useFavoritesStore } from '@/features/favorite-meal';
import { Heart, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useEffect, useState } from 'react';

export const Header: React.FC = () => {
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const loadFavorites = useFavoritesStore((state) => state.loadFavorites);

  const user = useUserStore((state) => state.user);
  const initAuth = useUserStore((state) => state.initAuth);
  const signOut = useUserStore((state) => state.signOut);

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  const handleSignOut = async () => {
    await signOut();
    void loadFavorites();
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md transition-colors">
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Heart className="size-4.5 text-red-500 fill-red-500/20" />
              <span className="hidden sm:inline">Favorites</span>
              {hasHydrated && favoritesCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full bg-red-500 text-white animate-in zoom-in-50 duration-200">
                  {favoritesCount}
                </span>
              )}
            </Link>

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

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
