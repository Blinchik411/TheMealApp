'use client';

import { type Meal, mealApi } from '@/entities/meal';
import { MealAreaFilter, MealCategoryFilter, MealSearch } from '@/features/filter-meals';
import { getRandomLetter } from '@/shared/lib/getRandomLetter';
import { getPaginatedData } from '@/shared/lib/paginationList';
import { MealGrid } from '@/widgets/meal-grid';
import { RotateCcw, Sparkles } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const ITEMS_PER_PAGE = 8;

export const HomePage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get('search') ?? '';
  const selectedArea = searchParams.get('area') ?? '';
  const selectedCategory = searchParams.get('category') ?? '';
  const pageParam = Number(searchParams.get('page') ?? '1');
  const currentPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const [randomLetter] = useState(() => getRandomLetter());
  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    let isMounted = true;
    Promise.all([mealApi.getCategories(), mealApi.getAreas()])
      .then(([cats, ars]) => {
        if (isMounted) {
          setCategories(cats);
          setAreas(ars);
        }
      })
      .catch((err) => {
        console.error('Failed to load filter metadata', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetchMeals = async () => {
      try {
        let result: Meal[] = [];
        if (searchQuery) {
          result = await mealApi.searchByName(searchQuery);
        } else if (selectedCategory) {
          result = await mealApi.filterByCategory(selectedCategory);
        } else if (selectedArea) {
          result = await mealApi.filterByArea(selectedArea);
        } else {
          result = await mealApi.searchByLetter(randomLetter);
        }

        if (isMounted) {
          setMeals(result);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load recipes');
          setIsLoading(false);
        }
      }
    };

    fetchMeals();

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedCategory, selectedArea, randomLetter]);

  const handleSearch = (query: string) => {
    updateParams({ search: query, category: '', area: '' });
  };

  const handleSelectCategory = (category: string) => {
    updateParams({ category, search: '', area: '' });
  };

  const handleSelectArea = (area: string) => {
    updateParams({ area, search: '', category: '' });
  };

  const handleResetFilters = () => {
    updateParams({ search: '', category: '', area: '' });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage > 1 ? String(newPage) : '' });
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const { paginatedItems, totalPages } = useMemo(() => {
    return getPaginatedData(meals, currentPage, ITEMS_PER_PAGE);
  }, [meals, currentPage]);

  const hasActiveFilters = Boolean(searchQuery || selectedCategory || selectedArea);

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto space-y-2 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
          <Sparkles className="size-3.5" />
          <span>Thousands of verified recipes</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Recipe Catalog
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Discover the best recipes from around the world, filter by cuisine, and save your
          favorites.
        </p>
      </div>

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

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 text-center">
          {error}
        </div>
      )}

      <MealGrid
        meals={paginatedItems}
        isLoading={isLoading}
        from="home"
        emptyMessage="No recipes found matching your query. Try resetting filters."
      />

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
          >
            ← Previous
          </button>

          <span className="text-xs font-medium text-muted-foreground px-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};
