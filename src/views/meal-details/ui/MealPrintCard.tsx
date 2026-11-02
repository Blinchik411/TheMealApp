import type { IngredientItem, Meal } from '@/entities/meal';

interface MealPrintCardProps {
  meal: Meal;
  ingredients: IngredientItem[];
  instructions: string[];
}

export const MealPrintCard = ({ meal, ingredients, instructions }: MealPrintCardProps) => {
  return (
    <div
      data-testid="meal-print-layout"
      aria-hidden="true"
      className="hidden print:block text-black bg-white w-full max-w-3xl mx-auto p-2 space-y-6 font-sans text-sm"
    >
      {/* Шапка рецепта для печати */}
      <div className="border-b-2 border-black/80 pb-4 flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-600 font-semibold">
            {meal.category && <span>Category: {meal.category}</span>}
            {meal.category && meal.cuisine && <span>•</span>}
            {meal.cuisine && <span>Cuisine: {meal.cuisine}</span>}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-black">
            {meal.title}
          </h2>
          <p className="text-xs text-neutral-500">
            Ingredients: {ingredients.length} items • Instructions: {instructions.length} steps
          </p>
        </div>

        {/* Компактная миниатюра блюда для печати */}
        {meal.image && (
          <div className="relative size-24 shrink-0 rounded-lg overflow-hidden border border-neutral-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={meal.image} alt={meal.title} className="size-full object-cover" />
          </div>
        )}
      </div>

      {/* Сетка ингредиентов с чекбоксами для кухни */}
      {ingredients.length > 0 && (
        <div className="space-y-3 break-inside-avoid">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-black">
              Ingredients ({ingredients.length})
            </h3>
            <span className="text-xs text-neutral-500 italic">Checklist for kitchen</span>
          </div>

          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm">
            {ingredients.map((item) => (
              <li key={`print-${item.id}`} className="flex items-start gap-2 break-inside-avoid">
                {/* Чекбокс для вычеркивания ручкой/карандашом */}
                <span className="inline-block size-3.5 border border-black/60 rounded-xs shrink-0 mt-0.5" />
                <span className="text-neutral-900 leading-tight">
                  {item.measure?.trim() ? `${item.measure.trim()} — ${item.name}` : item.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Пошаговая инструкция */}
      {instructions.length > 0 && (
        <div className="space-y-4">
          <div className="border-b border-neutral-200 pb-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-black">
              Instructions ({instructions.length} steps)
            </h3>
          </div>

          <ol className="space-y-3 text-xs sm:text-sm">
            {instructions.map((step, idx) => (
              <li
                key={`print-step-${idx + 1}`}
                className="flex items-start gap-3 break-inside-avoid"
              >
                <span className="shrink-0 flex items-center justify-center size-5 rounded-full border border-black/40 font-bold text-xs">
                  {idx + 1}
                </span>
                <p className="text-neutral-800 leading-relaxed pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Поле для заметок повара */}
      <div className="border border-dashed border-neutral-300 rounded-lg p-3 space-y-1.5 break-inside-avoid">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
          Cook&apos;s Notes:
        </span>
        <div className="h-8 border-b border-neutral-200" />
      </div>

      {/* Подвал листа печати */}
      <div className="pt-3 border-t border-neutral-300 flex items-center justify-between text-[11px] text-neutral-500 break-inside-avoid">
        <span>TheMealApp • Printable Recipe</span>
        <span>Printed recipe</span>
      </div>
    </div>
  );
};
