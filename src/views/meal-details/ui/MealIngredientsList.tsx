import type { IngredientItem } from '@/entities/meal';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface MealIngredientsListProps {
  ingredients: IngredientItem[];
  checkedIngredients: Record<string, boolean>;
  checkedIngredientsCount: number;
  ingredientsProgress: number;
  hasProgress: boolean;
  onToggleIngredient: (id: string) => void;
  onReset: () => void;
}

export const MealIngredientsList = ({
  ingredients,
  checkedIngredients,
  checkedIngredientsCount,
  ingredientsProgress,
  hasProgress,
  onToggleIngredient,
  onReset,
}: MealIngredientsListProps) => {
  const t = useTranslations('MealDetails');

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {t('ingredients')} ({ingredients.length})
        </h2>
        {hasProgress ? (
          <button
            type="button"
            onClick={onReset}
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

      <ul className="space-y-2">
        {ingredients.map((item) => {
          const isChecked = Boolean(checkedIngredients[item.id]);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onToggleIngredient(item.id)}
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
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  {item.measure?.trim() || t('toTaste')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {ingredients.length > 0 && (
        <div className="space-y-1.5 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('preparedItems')}</span>
            <span className="font-semibold text-foreground">
              {t('progressRatio', {
                checked: checkedIngredientsCount,
                total: ingredients.length,
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
      )}
    </div>
  );
};
