import { Check } from 'lucide-react';

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
  if (instructions.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Step-by-step Recipe</h2>
        <span className="text-xs text-muted-foreground">Click to check off</span>
      </div>

      <ol className="space-y-3">
        {instructions.map((step, index) => {
          const isChecked = Boolean(checkedSteps[index]);
          return (
            <li key={`step-${index + 1}`}>
              <button
                type="button"
                onClick={() => onToggleStep(index)}
                className={`w-full flex items-start gap-4 p-3.5 rounded-2xl border transition-all cursor-pointer select-none text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  isChecked
                    ? 'bg-muted/40 border-border/40'
                    : 'bg-card border-border/40 hover:bg-accent/60 hover:border-primary/30'
                }`}
              >
                <span
                  className={`shrink-0 flex items-center justify-center size-8 rounded-full font-bold text-sm transition-all duration-200 ${
                    isChecked
                      ? 'bg-primary text-primary-foreground shadow-xs scale-105'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {isChecked ? <Check className="size-4.5 stroke-[3]" /> : index + 1}
                </span>
                <p
                  className={`pt-1 text-sm sm:text-base leading-relaxed transition-all ${
                    isChecked
                      ? 'line-through opacity-50 text-muted-foreground'
                      : 'text-foreground/90'
                  }`}
                >
                  {step}
                </p>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
