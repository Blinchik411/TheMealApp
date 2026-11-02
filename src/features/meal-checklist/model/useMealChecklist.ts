'use client';

import { useEffect, useRef, useState } from 'react';

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

const STORAGE_PREFIX = 'meal-checklist-';

export const useMealChecklist = ({
  mealId,
  totalIngredients,
}: UseMealChecklistOptions): UseMealChecklistReturn => {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const isHydratedRef = useRef(false);

  // 1. Чтение сохраненного состояния из localStorage
  useEffect(() => {
    isHydratedRef.current = false;
    if (!mealId || typeof window === 'undefined') {
      isHydratedRef.current = true;
      return;
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${mealId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCheckedIngredients(parsed.ingredients || {});
        setCheckedSteps(parsed.steps || {});
      } else {
        setCheckedIngredients({});
        setCheckedSteps({});
      }
    } catch (e) {
      console.error('Failed to load meal checklist from localStorage', e);
    } finally {
      isHydratedRef.current = true;
    }
  }, [mealId]);

  // 2. Автоматическое сохранение в localStorage при изменении
  useEffect(() => {
    if (!isHydratedRef.current || !mealId || typeof window === 'undefined') return;

    const hasAnyChecked =
      Object.values(checkedIngredients).some(Boolean) || Object.values(checkedSteps).some(Boolean);

    try {
      if (!hasAnyChecked) {
        localStorage.removeItem(`${STORAGE_PREFIX}${mealId}`);
      } else {
        localStorage.setItem(
          `${STORAGE_PREFIX}${mealId}`,
          JSON.stringify({
            ingredients: checkedIngredients,
            steps: checkedSteps,
            updatedAt: Date.now(),
          }),
        );
      }
    } catch (e) {
      console.error('Failed to save meal checklist to localStorage', e);
    }
  }, [mealId, checkedIngredients, checkedSteps]);

  const checkedIngredientsCount = Object.values(checkedIngredients).filter(Boolean).length;
  const ingredientsProgress =
    totalIngredients > 0 ? Math.round((checkedIngredientsCount / totalIngredients) * 100) : 0;

  const hasProgress = checkedIngredientsCount > 0 || Object.values(checkedSteps).some(Boolean);

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const reset = () => {
    setCheckedIngredients({});
    setCheckedSteps({});
    if (mealId && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${mealId}`);
      } catch (e) {
        console.error('Failed to clear meal checklist from localStorage', e);
      }
    }
  };

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
