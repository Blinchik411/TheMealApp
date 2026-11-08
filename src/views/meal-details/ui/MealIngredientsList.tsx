'use client';

import type { IngredientItem } from '@/entities/meal';
import { useMealChecklistStore } from '@/features/meal-checklist';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

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

interface MealIngredientItemProps {
  id: string;
  name: string;
  measure?: string;
  mealId?: string;
  isChecked?: boolean;
  onToggle?: (id: string) => void;
  toTasteLabel: string;
}

export const MealIngredientItem = memo(
  ({
    id,
    name,
    measure,
    mealId,
    isChecked: propIsChecked,
    onToggle,
    toTasteLabel,
  }: MealIngredientItemProps) => {
    const storeIsChecked = useMealChecklistStore((state) =>
      mealId ? Boolean(state.checklists[mealId]?.ingredients[id]) : false,
    );
    const toggleFromStore = useMealChecklistStore((state) => state.toggleIngredient);

    const isChecked = mealId ? storeIsChecked : Boolean(propIsChecked);

    const handleToggle = () => {
      if (mealId) {
        toggleFromStore(mealId, id);
      } else if (onToggle) {
        onToggle(id);
      }
    };

    return (
      <li>
        <button
          type="button"
          onClick={handleToggle}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            isChecked
              ? 'bg-muted/40 border-border/40 opacity-60 line-through'
              : 'bg-card border-border hover:bg-accent hover:border-primary/30'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2
              className={`size-4 ${
                isChecked ? 'text-primary fill-primary/20' : 'text-muted-foreground'
              }`}
            />
            <span className="text-sm font-medium text-foreground">{name}</span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {measure?.trim() || toTasteLabel}
          </span>
        </button>
      </li>
    );
  },
);
MealIngredientItem.displayName = 'MealIngredientItem';

const MealIngredientsHeader = memo(
  ({
    mealId,
    totalCount,
    hasProgress: propHasProgress,
    onReset: propOnReset,
  }: {
    mealId?: string;
    totalCount: number;
    hasProgress?: boolean;
    onReset?: () => void;
  }) => {
    const t = useTranslations('MealDetails');
    const storeHasProgress = useMealChecklistStore((state) => {
      if (!mealId) return false;
      const data = state.checklists[mealId];
      if (!data) return false;
      return (
        Object.values(data.ingredients).some(Boolean) || Object.values(data.steps).some(Boolean)
      );
    });
    const resetChecklist = useMealChecklistStore((state) => state.resetChecklist);

    const hasProgress = mealId ? storeHasProgress : Boolean(propHasProgress);

    const handleReset = () => {
      if (mealId) {
        resetChecklist(mealId);
      } else if (propOnReset) {
        propOnReset();
      }
    };

    return (
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {t('ingredients')} ({totalCount})
        </h2>
        {hasProgress ? (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors cursor-pointer py-0.5 px-1.5 -mr-1.5 rounded-lg hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
            title={t('resetProgress')}
          >
            <RotateCcw className="size-3.5" />
            <span>{t('resetProgress')}</span>
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">{t('clickToCheckOff')}</span>
        )}
      </div>
    );
  },
);
MealIngredientsHeader.displayName = 'MealIngredientsHeader';

const MealIngredientsProgress = memo(
  ({
    mealId,
    totalIngredients,
    checkedCount: propCheckedCount,
    progress: propProgress,
  }: {
    mealId?: string;
    totalIngredients: number;
    checkedCount?: number;
    progress?: number;
  }) => {
    const t = useTranslations('MealDetails');
    const checkedCountFromStore = useMealChecklistStore((state) => {
      if (!mealId) return 0;
      const data = state.checklists[mealId]?.ingredients;
      if (!data) return 0;
      return Object.values(data).filter(Boolean).length;
    });

    const checkedIngredientsCount = mealId ? checkedCountFromStore : (propCheckedCount ?? 0);

    const ingredientsProgress =
      totalIngredients > 0
        ? Math.round((checkedIngredientsCount / totalIngredients) * 100)
        : (propProgress ?? 0);

    return (
      <div className="space-y-1.5 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('preparedItems')}</span>
          <span className="font-semibold text-foreground">
            {t('progressRatio', {
              checked: checkedIngredientsCount,
              total: totalIngredients,
              percent: ingredientsProgress,
            })}
          </span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${ingredientsProgress}%` }}
          />
        </div>
      </div>
    );
  },
);
MealIngredientsProgress.displayName = 'MealIngredientsProgress';

export const MealIngredientsList = ({
  mealId,
  ingredients,
  checkedIngredients,
  checkedIngredientsCount,
  ingredientsProgress,
  hasProgress,
  onToggleIngredient,
  onReset,
}: MealIngredientsListProps) => {
  const t = useTranslations('MealDetails');
  const toTasteLabel = t('toTaste');

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
      <MealIngredientsHeader
        mealId={mealId}
        totalCount={ingredients.length}
        hasProgress={hasProgress}
        onReset={onReset}
      />

      <ul className="space-y-2">
        {ingredients.map((item) => (
          <MealIngredientItem
            key={item.id}
            id={item.id}
            name={item.name}
            measure={item.measure}
            mealId={mealId}
            isChecked={checkedIngredients ? Boolean(checkedIngredients[item.id]) : undefined}
            onToggle={onToggleIngredient}
            toTasteLabel={toTasteLabel}
          />
        ))}
      </ul>

      {ingredients.length > 0 && (
        <MealIngredientsProgress
          mealId={mealId}
          totalIngredients={ingredients.length}
          checkedCount={checkedIngredientsCount}
          progress={ingredientsProgress}
        />
      )}
    </div>
  );
};
