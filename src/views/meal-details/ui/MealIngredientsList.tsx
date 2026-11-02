import type { IngredientItem } from '@/entities/meal';
import { CheckCircle2 } from 'lucide-react';

export interface MealIngredientsListProps {
  ingredients: IngredientItem[];
  checkedIngredients: Record<string, boolean>;
  onToggleIngredient: (id: string) => void;
}

export const MealIngredientsList = ({
  ingredients,
  checkedIngredients,
  onToggleIngredient,
}: MealIngredientsListProps) => {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Ingredients ({ingredients.length})
        </h2>
        <span className="text-xs text-muted-foreground">Click to check off</span>
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
                  {item.measure?.trim() || 'To taste'}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
