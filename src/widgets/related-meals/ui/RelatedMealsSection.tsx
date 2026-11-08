import { type Meal, MealCard } from '@/entities/meal';
import { FavoriteButton } from '@/features/favorite-meal';
import { Link } from '@/shared/config/i18n';
import { ArrowRight, Utensils } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface RelatedMealsSectionProps {
  relatedMeals?: Meal[];
  category?: string;
  imageAspectRatio?: string;
}

export const RelatedMealsSection = ({
  relatedMeals,
  category,
  imageAspectRatio = 'aspect-square',
}: RelatedMealsSectionProps) => {
  const t = useTranslations('MealDetails');

  if (!relatedMeals || relatedMeals.length === 0) {
    return null;
  }

  const categoryName = category || t('defaultCategory');

  return (
    <section className="pt-8 border-t border-border/60 space-y-6 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary mb-1.5">
            <Utensils className="size-3" />
            <span>{t('relatedRecipes')}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t('moreInCategory', { category: categoryName })}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">{t('moreInCategorySubtitle')}</p>
        </div>

        {category && category !== 'General' && (
          <Link
            href={`/?category=${encodeURIComponent(category)}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline group"
          >
            <span>{t('viewAllInCategory', { category })}</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
        {relatedMeals.map((relatedMeal, index) => (
          <MealCard
            key={relatedMeal.id || `related-meal-${index + 1}`}
            meal={relatedMeal}
            from="details"
            imageAspectRatio={imageAspectRatio}
            actionSlot={<FavoriteButton meal={relatedMeal} />}
          />
        ))}
      </div>
    </section>
  );
};

export const RelatedMealsSkeleton = () => {
  return (
    <section className="pt-8 border-t border-border/60 space-y-6 print:hidden animate-pulse">
      <div className="space-y-2">
        <div className="h-5 w-32 bg-muted rounded-full" />
        <div className="h-7 w-48 bg-muted rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`rel-skel-${i + 1}`}
            className="flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border"
          >
            <div className="w-full aspect-square bg-muted" />
            <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-8 bg-muted rounded-lg w-full mt-auto" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
