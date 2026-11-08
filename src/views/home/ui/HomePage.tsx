import type { Meal } from '@/entities/meal';
import { Link } from '@/shared/config/i18n';
import { MealGrid } from '@/widgets/meal-grid';
import { Dices, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Home');

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
          <Sparkles className="size-3.5" />
          <span>{t('badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">{t('description')}</p>
        <div className="pt-1">
          <Link
            href="/meal/random"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-medium text-xs sm:text-sm transition-all shadow-2xs hover:scale-105 active:scale-95"
          >
            <Dices className="size-4" />
            <span>{t('surpriseMe')}</span>
          </Link>
        </div>
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

      <MealGrid meals={meals} from="home" emptyMessage={t('emptyMessage')} />

      <HomePagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
};
