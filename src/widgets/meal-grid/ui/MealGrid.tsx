'use client';

import { type Meal, MealCard } from '@/entities/meal';
import { FavoriteButton } from '@/features/favorite-meal';
import { cn } from '@/shared/lib/utils';
import { Utensils } from 'lucide-react';

const SKELETON_KEYS = Array.from({ length: 24 }, (_, i) => `meal-skeleton-${i + 1}`);

export interface MealGridProps {
  meals: Meal[];
  isLoading?: boolean;
  skeletonCount?: number;
  from?: string;
  emptyMessage?: string;
  imageAspectRatio?: string;
}

export const MealGrid = ({
  meals,
  isLoading = false,
  skeletonCount = 12,
  from,
  emptyMessage = 'No recipes found',
  imageAspectRatio = 'aspect-square',
}: MealGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
        {SKELETON_KEYS.slice(0, skeletonCount).map((key) => (
          <div
            key={key}
            className="flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border animate-pulse"
          >
            <div className={cn('w-full bg-muted', imageAspectRatio)} />
            <div className="p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 flex-1">
              <div className="h-3.5 sm:h-4 bg-muted rounded-md w-3/4" />
              <div className="h-3 bg-muted rounded-md w-1/2" />
              <div className="mt-auto h-8 sm:h-9 bg-muted rounded-lg sm:rounded-xl w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border rounded-2xl bg-muted/20">
        <div className="flex items-center justify-center size-12 rounded-2xl bg-muted text-muted-foreground mb-3">
          <Utensils className="size-6" />
        </div>
        <h3 className="font-semibold text-base text-foreground mb-1">Nothing Found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
      {meals.map((meal, index) => (
        <MealCard
          key={meal.id}
          meal={meal}
          priority={index < 4}
          from={from}
          imageAspectRatio={imageAspectRatio}
          actionSlot={<FavoriteButton meal={meal} stopProp={true} />}
        />
      ))}
    </div>
  );
};
