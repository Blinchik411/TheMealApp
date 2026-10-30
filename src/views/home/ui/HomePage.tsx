import type { Meal } from '@/entities/meal';
import { MealGrid } from '@/widgets/meal-grid';
import { Sparkles } from 'lucide-react';
import { HomeFilters } from './HomeFilters';
import { HomePagination } from './HomePagination';

interface HomePageProps {
  meals: Meal[];
  categories: string[];
  areas: string[];
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  selectedCategory: string;
  selectedArea: string;
  error?: string | null;
}

export const HomePage = ({
  meals,
  categories,
  areas,
  currentPage,
  totalPages,
  searchQuery,
  selectedCategory,
  selectedArea,
  error,
}: HomePageProps) => {
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

      <HomeFilters
        categories={categories}
        areas={areas}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedArea={selectedArea}
      />

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 text-center">
          {error}
        </div>
      )}

      <MealGrid
        meals={meals}
        from="home"
        emptyMessage="No recipes found matching your query. Try resetting filters."
      />

      <HomePagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
};
