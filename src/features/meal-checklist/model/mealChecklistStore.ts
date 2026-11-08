'use client';

import { create } from 'zustand';

export interface MealChecklistData {
  ingredients: Record<string, boolean>;
  steps: Record<number, boolean>;
}

export interface MealChecklistState {
  checklists: Record<string, MealChecklistData>;
  initMealChecklist: (mealId: string) => void;
  toggleIngredient: (mealId: string, id: string) => void;
  toggleStep: (mealId: string, index: number) => void;
  resetChecklist: (mealId: string) => void;
  resetAll: () => void;
}

const STORAGE_PREFIX = 'meal-checklist-';

export const EMPTY_MEAL_DATA: MealChecklistData = Object.freeze({
  ingredients: Object.freeze({}),
  steps: Object.freeze({}),
}) as MealChecklistData;

export const loadChecklistFromStorage = (mealId: string): MealChecklistData => {
  if (typeof window === 'undefined' || !mealId) {
    return EMPTY_MEAL_DATA;
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${mealId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ingredients: parsed.ingredients || {},
        steps: parsed.steps || {},
      };
    }
  } catch (error) {
    console.error('Failed to load meal checklist from localStorage', error);
  }
  return {
    ingredients: {},
    steps: {},
  };
};

const persistChecklistToStorage = (mealId: string, data: MealChecklistData) => {
  if (typeof window === 'undefined' || !mealId) return;

  const hasAnyChecked =
    Object.values(data.ingredients).some(Boolean) || Object.values(data.steps).some(Boolean);

  try {
    if (!hasAnyChecked) {
      localStorage.removeItem(`${STORAGE_PREFIX}${mealId}`);
    } else {
      localStorage.setItem(
        `${STORAGE_PREFIX}${mealId}`,
        JSON.stringify({
          ingredients: data.ingredients,
          steps: data.steps,
          updatedAt: Date.now(),
        }),
      );
    }
  } catch (error) {
    console.error('Failed to save meal checklist to localStorage', error);
  }
};

export const useMealChecklistStore = create<MealChecklistState>()((set, get) => ({
  checklists: {},

  initMealChecklist: (mealId: string) => {
    if (!mealId) return;
    const existing = get().checklists[mealId];
    if (existing) return;

    const data = loadChecklistFromStorage(mealId);
    set((state) => ({
      checklists: {
        ...state.checklists,
        [mealId]: data,
      },
    }));
  },

  toggleIngredient: (mealId: string, id: string) => {
    const current = get().checklists[mealId] || loadChecklistFromStorage(mealId);
    const updatedIngredients = {
      ...current.ingredients,
      [id]: !current.ingredients[id],
    };

    const nextData: MealChecklistData = {
      ...current,
      ingredients: updatedIngredients,
    };

    set((state) => ({
      checklists: {
        ...state.checklists,
        [mealId]: nextData,
      },
    }));

    if (mealId) {
      persistChecklistToStorage(mealId, nextData);
    }
  },

  toggleStep: (mealId: string, index: number) => {
    const current = get().checklists[mealId] || loadChecklistFromStorage(mealId);
    const updatedSteps = {
      ...current.steps,
      [index]: !current.steps[index],
    };

    const nextData: MealChecklistData = {
      ...current,
      steps: updatedSteps,
    };

    set((state) => ({
      checklists: {
        ...state.checklists,
        [mealId]: nextData,
      },
    }));

    if (mealId) {
      persistChecklistToStorage(mealId, nextData);
    }
  },

  resetChecklist: (mealId: string) => {
    const nextData: MealChecklistData = {
      ingredients: {},
      steps: {},
    };

    set((state) => ({
      checklists: {
        ...state.checklists,
        [mealId]: nextData,
      },
    }));

    if (mealId && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${mealId}`);
      } catch (error) {
        console.error('Failed to remove checklist from localStorage', error);
      }
    }
  },

  resetAll: () => {
    set({ checklists: {} });
  },
}));
