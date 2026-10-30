'use client';

import { MealAreaFilter, MealCategoryFilter, MealSearch } from '@/features/filter-meals';
import { RotateCcw } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface HomeFiltersProps {
  categories: string[];
  areas: string[];
  searchQuery: string;
  selectedCategory: string;
  selectedArea: string;
}

export const HomeFilters = ({
  categories,
  areas,
  searchQuery,
  selectedCategory,
  selectedArea,
}: HomeFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(newParams)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      if (!('page' in newParams)) {
        params.delete('page');
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const handleSearch = (query: string) => {
    updateParams({ search: query });
  };

  const handleSelectCategory = (category: string) => {
    updateParams({ category: category === selectedCategory ? '' : category });
  };

  const handleSelectArea = (area: string) => {
    updateParams({ area: area === selectedArea ? '' : area });
  };

  const handleResetFilters = () => {
    updateParams({ search: '', category: '', area: '' });
  };

  const hasActiveFilters = Boolean(searchQuery || selectedCategory || selectedArea);

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
      <MealSearch value={searchQuery} onSearch={handleSearch} />

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-3 border-t border-border/60">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <MealAreaFilter
            areas={areas}
            selectedArea={selectedArea}
            onSelectArea={handleSelectArea}
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-destructive/20"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="pt-2">
          <MealCategoryFilter
            categories={categories}
            activeCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        </div>
      )}
    </div>
  );
};
