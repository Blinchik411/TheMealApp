import { type Meal, MealCard } from '@/entities/meal';
import { FavoriteButton } from '@/features/favorite-meal';
import { ArrowRight, Utensils } from 'lucide-react';
import Link from 'next/link';

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
  if (!relatedMeals || relatedMeals.length === 0) {
    return null;
  }

  const categoryName = category || 'Recipes';

  return (
    <section className="pt-8 border-t border-border/60 space-y-6 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary mb-1.5">
            <Utensils className="size-3" />
            <span>Related Recipes</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            More in {categoryName}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            You might also enjoy these popular dishes
          </p>
        </div>

        {category && category !== 'General' && (
          <Link
            href={`/?category=${encodeURIComponent(category)}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline group"
          >
            <span>View all {category}</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
        {relatedMeals.map((relatedMeal) => (
          <MealCard
            key={relatedMeal.id}
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
