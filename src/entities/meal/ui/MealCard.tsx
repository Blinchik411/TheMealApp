import { Link } from '@/shared/config/i18n';
import { cn } from '@/shared/lib/utils';
import Image from 'next/image';
import type { ReactNode } from 'react';
import type { Meal } from '../model/types';

export interface MealCardProps {
  meal: Meal;
  from?: string;
  actionSlot?: ReactNode;
  priority?: boolean;
  imageAspectRatio?: string;
}

export const MealCard = ({
  meal,
  from,
  actionSlot,
  priority = false,
  imageAspectRatio = 'aspect-square',
}: MealCardProps) => {
  const linkTo = from ? `/meal/${meal.id}?from=${from}` : `/meal/${meal.id}`;

  return (
    <div className="group flex flex-col h-full bg-card text-card-foreground rounded-2xl overflow-hidden border border-border shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Контейнер картинки с Next.js Image */}
      <div className={cn('relative w-full bg-muted overflow-hidden', imageAspectRatio)}>
        <Image
          src={meal.image}
          alt={meal.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {actionSlot && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">{actionSlot}</div>
        )}
      </div>

      {/* Описание блюда */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5 sm:gap-3">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
            {meal.category && (
              <span className="text-[10px] sm:text-[11px] font-medium px-1.5 py-0.5 sm:px-2 rounded-full bg-primary/10 text-primary">
                {meal.category}
              </span>
            )}
            {meal.cuisine && (
              <span className="text-[10px] sm:text-[11px] font-medium px-1.5 py-0.5 sm:px-2 rounded-full bg-secondary text-secondary-foreground">
                {meal.cuisine}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-xs sm:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {meal.title}
          </h3>
        </div>

        <Link
          href={linkTo}
          className="mt-auto inline-flex w-full items-center justify-center rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
        >
          View Recipe
        </Link>
      </div>
    </div>
  );
};
