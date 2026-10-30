'use client';

import { type Meal, MealCard } from '@/entities/meal';
import { FavoriteButton } from '@/features/favorite-meal';
import { Utensils } from 'lucide-react';

const SKELETON_KEYS = [
  'meal-skeleton-1',
  'meal-skeleton-2',
  'meal-skeleton-3',
  'meal-skeleton-4',
  'meal-skeleton-5',
  'meal-skeleton-6',
  'meal-skeleton-7',
  'meal-skeleton-8',
] as const;

interface MealGridProps {
  meals: Meal[];
  isLoading?: boolean;
  from?: string;
  emptyMessage?: string;
}

export const MealGrid = ({
  meals,
  isLoading = false,
  from,
  emptyMessage = 'No recipes found',
}: MealGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {SKELETON_KEYS.map((key) => (
          <div
            key={key}
            className="flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border animate-pulse"
          >
            <div className="w-full aspect-square bg-muted" />
            <div className="p-4 flex flex-col gap-3 flex-1">
              <div className="h-4 bg-muted rounded-md w-3/4" />
              <div className="h-3 bg-muted rounded-md w-1/2" />
              <div className="mt-auto h-9 bg-muted rounded-xl w-full" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {meals.map((meal) => (
        <MealCard
          key={meal.idMeal}
          meal={meal}
          from={from}
          actionSlot={<FavoriteButton meal={meal} stopProp={true} />}
        />
      ))}
    </div>
  );
};
