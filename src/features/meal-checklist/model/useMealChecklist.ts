'use client';

import { useCallback, useEffect } from 'react';
import { EMPTY_MEAL_DATA, useMealChecklistStore } from './mealChecklistStore';

export interface UseMealChecklistOptions {
  mealId?: string;
  totalIngredients: number;
}

export interface UseMealChecklistReturn {
  checkedIngredients: Record<string, boolean>;
  checkedSteps: Record<number, boolean>;
  checkedIngredientsCount: number;
  ingredientsProgress: number;
  hasProgress: boolean;
  toggleIngredient: (id: string) => void;
  toggleStep: (index: number) => void;
  reset: () => void;
}

export const useMealChecklist = ({
  mealId = '',
  totalIngredients,
}: UseMealChecklistOptions): UseMealChecklistReturn => {
  const initMealChecklist = useMealChecklistStore((state) => state.initMealChecklist);
  const rawToggleIngredient = useMealChecklistStore((state) => state.toggleIngredient);
  const rawToggleStep = useMealChecklistStore((state) => state.toggleStep);
  const rawReset = useMealChecklistStore((state) => state.resetChecklist);

  useEffect(() => {
    if (mealId) {
      initMealChecklist(mealId);
    }
  }, [mealId, initMealChecklist]);

  const mealData = useMealChecklistStore((state) => state.checklists[mealId] ?? EMPTY_MEAL_DATA);

  const checkedIngredients = mealData.ingredients;
  const checkedSteps = mealData.steps;

  const checkedIngredientsCount = Object.values(checkedIngredients).filter(Boolean).length;
  const ingredientsProgress =
    totalIngredients > 0 ? Math.round((checkedIngredientsCount / totalIngredients) * 100) : 0;

  const hasProgress = checkedIngredientsCount > 0 || Object.values(checkedSteps).some(Boolean);

  const toggleIngredient = useCallback(
    (id: string) => {
      rawToggleIngredient(mealId, id);
    },
    [mealId, rawToggleIngredient],
  );

  const toggleStep = useCallback(
    (index: number) => {
      rawToggleStep(mealId, index);
    },
    [mealId, rawToggleStep],
  );

  const reset = useCallback(() => {
    rawReset(mealId);
  }, [mealId, rawReset]);

  return {
    checkedIngredients,
    checkedSteps,
    checkedIngredientsCount,
    ingredientsProgress,
    hasProgress,
    toggleIngredient,
    toggleStep,
    reset,
  };
};
