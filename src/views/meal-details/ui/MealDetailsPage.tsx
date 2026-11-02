'use client';

import { type Meal, parseInstructions } from '@/entities/meal';
import { FavoriteButton } from '@/features/favorite-meal';
import { useMealChecklist } from '@/features/meal-checklist';
import { QuickActionsCard } from '@/features/share-meal';
import { RelatedMealsSection } from '@/widgets/related-meals';
import { Globe, Tag } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';
import { MealBackButton } from './MealBackButton';
import { MealIngredientsList } from './MealIngredientsList';
import { MealInstructionsList } from './MealInstructionsList';
import { MealPrintCard } from './MealPrintCard';
import { MealVideoSection } from './MealVideoSection';

export interface MealDetailsPageProps {
  meal: Meal;
  relatedMeals?: Meal[];
}

export const MealDetailsPage = ({ meal, relatedMeals }: MealDetailsPageProps) => {
  const ingredients = useMemo(() => meal.ingredients ?? [], [meal.ingredients]);
  const instructions = useMemo(() => parseInstructions(meal.instructions), [meal.instructions]);

  const {
    checkedIngredients,
    checkedSteps,
    checkedIngredientsCount,
    ingredientsProgress,
    toggleIngredient,
    toggleStep,
  } = useMealChecklist({
    mealId: meal.id,
    totalIngredients: ingredients.length,
  });

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-8 pb-16 print:hidden">
        <MealBackButton />

        {/* Заголовок рецепта и кнопка в избранное */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {meal.category && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  <Tag className="size-3" />
                  {meal.category}
                </span>
              )}
              {meal.cuisine && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                  <Globe className="size-3" />
                  {meal.cuisine}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {meal.title}
            </h1>
          </div>

          <div className="shrink-0">
            <FavoriteButton meal={meal} showText size="md" />
          </div>
        </div>

        {/* Основной блок: фото + быстрые действия и список ингредиентов */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 md:sticky md:top-24">
            <div className="relative w-full aspect-[4/3] md:aspect-square max-h-[300px] sm:max-h-[360px] md:max-h-none rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-sm bg-muted">
              <Image
                src={meal.image}
                alt={meal.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <QuickActionsCard
              mealTitle={meal.title}
              ingredients={ingredients}
              checkedIngredientsCount={checkedIngredientsCount}
              ingredientsProgress={ingredientsProgress}
            />
          </div>

          <MealIngredientsList
            ingredients={ingredients}
            checkedIngredients={checkedIngredients}
            onToggleIngredient={toggleIngredient}
          />
        </div>

        {/* Пошаговый рецепт */}
        <MealInstructionsList
          instructions={instructions}
          checkedSteps={checkedSteps}
          onToggleStep={toggleStep}
        />

        {/* Видео рецепта */}
        <MealVideoSection youtubeUrl={meal.youtubeUrl} title={meal.title} />

        {/* Похожие рецепты */}
        <RelatedMealsSection relatedMeals={relatedMeals} category={meal.category} />
      </div>

      {/* Печатная карточка (видна только при печати) */}
      <MealPrintCard meal={meal} ingredients={ingredients} instructions={instructions} />
    </>
  );
};
