'use client';

import { InteractiveStepText } from '@/features/cooking-timer';
import { useMealChecklistStore } from '@/features/meal-checklist';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

export interface MealInstructionsListProps {
  mealId?: string;
  instructions: string[];
  checkedSteps?: Record<number, boolean>;
  onToggleStep?: (index: number) => void;
}

interface MealInstructionStepItemProps {
  step: string;
  index: number;
  mealId?: string;
  isChecked?: boolean;
  onToggleStep?: (index: number) => void;
}

export const MealInstructionStepItem = memo(
  ({
    step,
    index,
    mealId,
    isChecked: propIsChecked,
    onToggleStep,
  }: MealInstructionStepItemProps) => {
    const storeIsChecked = useMealChecklistStore((state) =>
      mealId ? Boolean(state.checklists[mealId]?.steps[index]) : false,
    );
    const toggleStepFromStore = useMealChecklistStore((state) => state.toggleStep);

    const isChecked = mealId ? storeIsChecked : Boolean(propIsChecked);
    const stepId = `step-check-${index}`;

    const handleToggle = () => {
      if (mealId) {
        toggleStepFromStore(mealId, index);
      } else if (onToggleStep) {
        onToggleStep(index);
      }
    };

    return (
      <li>
        <div
          className={`w-full flex items-start gap-4 p-3.5 rounded-2xl border transition-all ${
            isChecked
              ? 'bg-muted/40 border-border/40'
              : 'bg-card border-border/40 hover:bg-accent/60 hover:border-primary/30'
          }`}
        >
          {/* Точечный лейбл для чекбокса без вложенных интерактивных кнопок таймера */}
          <label htmlFor={stepId} className="shrink-0 cursor-pointer pt-0.5">
            <input
              id={stepId}
              type="checkbox"
              checked={isChecked}
              onChange={handleToggle}
              className="sr-only"
            />
            <span
              className={`flex items-center justify-center size-8 rounded-full font-bold text-sm transition-all duration-200 ${
                isChecked
                  ? 'bg-primary text-primary-foreground shadow-xs scale-105'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              {isChecked ? <Check className="size-4.5 stroke-[3]" /> : index + 1}
            </span>
          </label>

          {/* Текст шага с кнопками быстрого таймера вне label */}
          <div
            className={`flex-1 pt-1 text-sm sm:text-base leading-relaxed transition-all ${
              isChecked ? 'line-through opacity-50 text-muted-foreground' : 'text-foreground/90'
            }`}
          >
            <InteractiveStepText text={step} />
          </div>
        </div>
      </li>
    );
  },
);
MealInstructionStepItem.displayName = 'MealInstructionStepItem';

export const MealInstructionsList = ({
  mealId,
  instructions,
  checkedSteps,
  onToggleStep,
}: MealInstructionsListProps) => {
  const t = useTranslations('MealDetails');

  if (instructions.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('stepByStep')}</h2>
        <span className="text-xs text-muted-foreground">{t('clickToCheckOff')}</span>
      </div>

      <ol className="space-y-3">
        {instructions.map((step, index) => (
          <MealInstructionStepItem
            key={`step-${index + 1}`}
            step={step}
            index={index}
            mealId={mealId}
            isChecked={checkedSteps ? Boolean(checkedSteps[index]) : undefined}
            onToggleStep={onToggleStep}
          />
        ))}
      </ol>
    </div>
  );
};
