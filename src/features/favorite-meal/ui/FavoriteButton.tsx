'use client';

import type { Meal } from '@/entities/meal';
import { cn } from '@/shared/lib/utils';
import { Heart } from 'lucide-react';
import type React from 'react';
import { useFavoritesStore } from '../model/favoritesStore';

interface FavoriteButtonProps {
  meal: Meal;
  showText?: boolean;
  stopProp?: boolean;
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  meal,
  showText = false,
  stopProp = false,
  className,
}) => {
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const liked = useFavoritesStore((state) => state.isFavorite(meal.idMeal));

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopProp) {
      e.stopPropagation();
    }
    toggleFavorite(meal);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full p-2 text-sm font-medium transition-all duration-200 cursor-pointer',
        'hover:scale-105 active:scale-95',
        liked
          ? 'text-red-500 hover:text-red-600 bg-red-500/10'
          : 'text-muted-foreground hover:text-foreground bg-background/80 hover:bg-background shadow-xs',
        className,
      )}
    >
      <Heart className={cn('size-4.5 transition-colors', liked ? 'fill-current' : 'fill-none')} />
      {showText && (
        <span className="text-xs font-semibold">{liked ? 'In Favorites' : 'To Favorites'}</span>
      )}
    </button>
  );
};
