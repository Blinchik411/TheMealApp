import { InteractiveStepText } from '@/features/cooking-timer';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface MealInstructionsListProps {
  instructions: string[];
  checkedSteps: Record<number, boolean>;
  onToggleStep: (index: number) => void;
}

export const MealInstructionsList = ({
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
        {instructions.map((step, index) => {
          const isChecked = Boolean(checkedSteps[index]);
          const stepId = `step-check-${index}`;
          return (
            <li key={`step-${index + 1}`}>
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
                    onChange={() => onToggleStep(index)}
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

                {/* Текст шага с безопасными кнопками быстрого таймера вне label */}
                <div
                  className={`flex-1 pt-1 text-sm sm:text-base leading-relaxed transition-all ${
                    isChecked
                      ? 'line-through opacity-50 text-muted-foreground'
                      : 'text-foreground/90'
                  }`}
                >
                  <InteractiveStepText text={step} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
