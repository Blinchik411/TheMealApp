'use client';

import { useState } from 'react';

export interface UseMealChecklistOptions {
  totalIngredients: number;
}

export interface UseMealChecklistReturn {
  checkedIngredients: Record<string, boolean>;
  checkedSteps: Record<number, boolean>;
  checkedIngredientsCount: number;
  ingredientsProgress: number;
  toggleIngredient: (id: string) => void;
  toggleStep: (index: number) => void;
  reset: () => void;
}

export const useMealChecklist = ({
  totalIngredients,
}: UseMealChecklistOptions): UseMealChecklistReturn => {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const checkedIngredientsCount = Object.values(checkedIngredients).filter(Boolean).length;
  const ingredientsProgress =
    totalIngredients > 0 ? Math.round((checkedIngredientsCount / totalIngredients) * 100) : 0;

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
  };

  return {
    checkedIngredients,
    checkedSteps,
    checkedIngredientsCount,
    ingredientsProgress,
    toggleIngredient,
    toggleStep,
    reset,
  };
};
