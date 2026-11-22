'use client';

import type { IngredientItem } from '@/entities/meal';
import { useTranslations } from 'next-intl';
import { useIngredientsChecklist } from '../model/useIngredientsChecklist';
import { MealIngredientItem } from './MealIngredientItem';
import { MealIngredientsHeader } from './MealIngredientsHeader';
import { MealIngredientsProgress } from './MealIngredientsProgress';

export interface MealIngredientsListProps {
  mealId?: string;
  ingredients: IngredientItem[];
  checkedIngredients?: Record<string, boolean>;
  checkedIngredientsCount?: number;
  ingredientsProgress?: number;
  hasProgress?: boolean;
  onToggleIngredient?: (id: string) => void;
  onReset?: () => void;
}

export function MealIngredientsList(props: MealIngredientsListProps) {
  const { ingredients } = props;
  const t = useTranslations('MealDetails');
  const toTasteLabel = t('toTaste');

  const { isItemChecked, handleToggle, hasProgress, handleReset, checkedCount, progressPercent } =
    useIngredientsChecklist(props);

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
      <MealIngredientsHeader
        totalCount={ingredients.length}
        hasProgress={hasProgress}
        onReset={handleReset}
      />

      <ul className="space-y-2">
        {ingredients.map((item) => (
          <MealIngredientItem
            key={item.id}
            id={item.id}
            name={item.name}
            measure={item.measure}
            isChecked={isItemChecked(item.id)}
            onToggle={handleToggle}
            toTasteLabel={toTasteLabel}
          />
        ))}
      </ul>

      {ingredients.length > 0 && (
        <MealIngredientsProgress
          totalCount={ingredients.length}
          checkedCount={checkedCount}
          progressPercent={progressPercent}
        />
      )}
    </div>
  );
}

export { MealIngredientItem } from './MealIngredientItem';
export { MealIngredientsHeader } from './MealIngredientsHeader';
export { MealIngredientsProgress } from './MealIngredientsProgress';
