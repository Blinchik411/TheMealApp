'use client';

import { useFavoritesStore } from '@/features/favorite-meal';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';

export const Header: React.FC = () => {
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
        >
          TheMealApp
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/favorites"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Heart className="size-4.5 text-red-500 fill-red-500/20" />
            <span>Favorites</span>
            {hasHydrated && favoritesCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full bg-red-500 text-white animate-in zoom-in-50 duration-200">
                {favoritesCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};
