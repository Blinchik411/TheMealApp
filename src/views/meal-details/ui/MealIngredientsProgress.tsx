'use client';

import { useTranslations } from 'next-intl';
import { memo } from 'react';

export interface MealIngredientsProgressProps {
  totalCount: number;
  checkedCount: number;
  progressPercent: number;
}

export const MealIngredientsProgress = memo(function MealIngredientsProgress({
  totalCount,
  checkedCount,
  progressPercent,
}: MealIngredientsProgressProps) {
  const t = useTranslations('MealDetails');

  return (
    <div className="space-y-1.5 pt-3 border-t border-border/50">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t('preparedItems')}</span>
        <span className="font-semibold text-foreground">
          {t('progressRatio', {
            checked: checkedCount,
            total: totalCount,
            percent: progressPercent,
          })}
        </span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
});

MealIngredientsProgress.displayName = 'MealIngredientsProgress';
