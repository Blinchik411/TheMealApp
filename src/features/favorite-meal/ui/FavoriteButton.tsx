'use client';

import type { Meal } from '@/entities/meal';
import { cn } from '@/shared/lib';
import { Heart } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useFavoritesSync } from '../lib/useFavoritesSync';
import { useFavoritesStore } from '../model/favoritesStore';

interface FavoriteButtonProps {
  meal: Meal;
  showText?: boolean;
  stopProp?: boolean;
  className?: string;
  size?: 'default' | 'md' | 'lg';
}

export const FavoriteButton = ({
  meal,
  showText = false,
  stopProp = false,
  className,
  size = 'default',
}: FavoriteButtonProps) => {
  const { toggleWithSync } = useFavoritesSync();
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const isFav = useFavoritesStore((state) => state.isFavorite(meal.id));
  const liked = hasHydrated ? isFav : false;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (stopProp) {
      e.stopPropagation();
    }
    void toggleWithSync(meal);
  };

  const isMd = size === 'md';
  const isLg = size === 'lg';
  const isCustomSize = isMd || isLg;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
      className={cn(
        'inline-flex items-center transition-all duration-200 cursor-pointer',
        'hover:scale-105 active:scale-95',
        isMd && 'gap-2 rounded-full px-4 py-2 sm:px-4.5 sm:py-2.5 border shadow-xs hover:shadow-sm',
        isLg &&
          'gap-2.5 sm:gap-3 rounded-full px-5 py-2.5 sm:px-6 sm:py-3 border shadow-xs hover:shadow-sm',
        !isCustomSize &&
          (showText ? 'gap-1.5 rounded-full px-3 py-1.5 shadow-xs' : 'rounded-full p-2 shadow-xs'),
        liked
          ? isCustomSize
            ? 'text-red-500 hover:text-red-600 bg-red-500/10 border-red-500/30'
            : 'text-red-500 hover:text-red-600 bg-red-500/10'
          : isCustomSize
            ? 'text-muted-foreground hover:text-foreground bg-background/80 hover:bg-background border-border/80'
            : 'text-muted-foreground hover:text-foreground bg-background/80 hover:bg-background',
        className,
      )}
    >
      <Heart
        className={cn(
          'transition-colors',
          isLg && 'size-5.5 sm:size-6',
          isMd && 'size-5',
          !isCustomSize && 'size-4.5',
          liked ? 'fill-current' : 'fill-none',
        )}
      />
      {showText && (
        <span
          className={cn(
            isLg && 'text-base sm:text-lg font-bold',
            isMd && 'text-sm sm:text-base font-semibold',
            !isCustomSize && 'text-xs font-semibold',
          )}
        >
          {liked ? 'In Favorites' : 'To Favorites'}
        </span>
      )}
    </button>
  );
};
