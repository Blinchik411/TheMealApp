import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Meal } from '../model/types';

interface MealCardProps {
  meal: Meal;
  from?: string;
  actionSlot?: ReactNode;
}

export const MealCard = ({ meal, from, actionSlot }: MealCardProps) => {
  const linkTo = from ? `/meal/${meal.idMeal}?from=${from}` : `/meal/${meal.idMeal}`;

  return (
    <div className="group flex flex-col h-full bg-card text-card-foreground rounded-2xl overflow-hidden border border-border shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Контейнер картинки с Next.js Image */}
      <div className="relative w-full aspect-square bg-muted overflow-hidden">
        <Image
          src={meal.strMealThumb}
          alt={meal.strMeal}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {actionSlot && <div className="absolute top-3 right-3 z-10">{actionSlot}</div>}
      </div>

      {/* Описание блюда */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {meal.strCategory && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {meal.strCategory}
              </span>
            )}
            {meal.strArea && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {meal.strArea}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {meal.strMeal}
          </h3>
        </div>

        <Link
          href={linkTo}
          className="mt-auto inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
        >
          View Recipe
        </Link>
      </div>
    </div>
  );
};
