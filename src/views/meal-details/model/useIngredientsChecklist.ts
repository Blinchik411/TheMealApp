'use client';

import type { IngredientItem } from '@/entities/meal';
import { useMealChecklistStore } from '@/features/meal-checklist';
import { useCallback, useMemo } from 'react';

export interface UseIngredientsChecklistOptions {
  mealId?: string;
  ingredients: IngredientItem[];
  checkedIngredients?: Record<string, boolean>;
  checkedIngredientsCount?: number;
  ingredientsProgress?: number;
  hasProgress?: boolean;
  onToggleIngredient?: (id: string) => void;
  onReset?: () => void;
}

export function useIngredientsChecklist({
  mealId,
  ingredients,
  checkedIngredients,
  checkedIngredientsCount: propCheckedCount,
  ingredientsProgress: propProgress,
  hasProgress: propHasProgress,
  onToggleIngredient,
  onReset: propOnReset,
}: UseIngredientsChecklistOptions) {
  const storeIngredients = useMealChecklistStore((state) =>
    mealId ? state.checklists[mealId]?.ingredients : undefined,
  );

  const storeHasProgress = useMealChecklistStore((state) => {
    if (!mealId) return false;
    const data = state.checklists[mealId];
    if (!data) return false;
    return Object.values(data.ingredients).some(Boolean) || Object.values(data.steps).some(Boolean);
  });

  const toggleStoreIngredient = useMealChecklistStore((state) => state.toggleIngredient);
  const resetStoreChecklist = useMealChecklistStore((state) => state.resetChecklist);

  const isItemChecked = useCallback(
    (ingredientId: string): boolean => {
      if (mealId) {
        return Boolean(storeIngredients?.[ingredientId]);
      }
      return Boolean(checkedIngredients?.[ingredientId]);
    },
    [mealId, storeIngredients, checkedIngredients],
  );

  const handleToggle = useCallback(
    (ingredientId: string) => {
      if (mealId) {
        toggleStoreIngredient(mealId, ingredientId);
      } else if (onToggleIngredient) {
        onToggleIngredient(ingredientId);
      }
    },
    [mealId, toggleStoreIngredient, onToggleIngredient],
  );

  const hasProgress = mealId ? storeHasProgress : Boolean(propHasProgress);

  const handleReset = useCallback(() => {
    if (mealId) {
      resetStoreChecklist(mealId);
    } else if (propOnReset) {
      propOnReset();
    }
  }, [mealId, resetStoreChecklist, propOnReset]);

  const checkedCount = useMemo(() => {
    if (mealId) {
      if (!storeIngredients) return 0;
      return Object.values(storeIngredients).filter(Boolean).length;
    }
    return propCheckedCount ?? 0;
  }, [mealId, storeIngredients, propCheckedCount]);

  const progressPercent = useMemo(() => {
    if (ingredients.length > 0) {
      return Math.round((checkedCount / ingredients.length) * 100);
    }
    return propProgress ?? 0;
  }, [ingredients.length, checkedCount, propProgress]);

  return {
    isItemChecked,
    handleToggle,
    hasProgress,
    handleReset,
    checkedCount,
    progressPercent,
  };
}
