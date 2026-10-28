'use client';

import { cn } from '@/shared/lib/utils';
import type React from 'react';
import { useMemo } from 'react';

interface MealCategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const MealCategoryFilter: React.FC<MealCategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  const uniqueCategories = useMemo(() => Array.from(new Set(categories)), [categories]);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        type="button"
        onClick={() => onSelectCategory('')}
        className={cn(
          'px-4 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer active:scale-95 shadow-2xs',
          activeCategory === ''
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground',
        )}
      >
        All Categories
      </button>

      {uniqueCategories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={cn(
              'px-3.5 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer active:scale-95 shadow-2xs',
              isActive
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};
