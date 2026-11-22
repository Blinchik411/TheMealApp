'use client';

import { CheckCircle2 } from 'lucide-react';
import { memo } from 'react';

export interface MealIngredientItemProps {
  id: string;
  name: string;
  measure?: string;
  isChecked: boolean;
  onToggle: (id: string) => void;
  toTasteLabel: string;
}

export const MealIngredientItem = memo(function MealIngredientItem({
  id,
  name,
  measure,
  isChecked,
  onToggle,
  toTasteLabel,
}: MealIngredientItemProps) {
  const handleClick = () => {
    onToggle(id);
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
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
});

MealIngredientItem.displayName = 'MealIngredientItem';
