'use client';

import { cn } from '@/shared/lib';
import { Search, X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

export interface MealSearchProps {
  value: string;
  onSearch?: (query: string) => void;
  action?: string;
  hiddenFields?: Record<string, string | undefined>;
  placeholder?: string;
  className?: string;
}

export const MealSearch = ({
  value,
  onSearch,
  action = '/',
  hiddenFields,
  placeholder = 'Search recipes (e.g., Pancakes, Chicken, Pie)...',
  className,
}: MealSearchProps) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSubmit = (e: FormEvent) => {
    if (onSearch) {
      e.preventDefault();
      onSearch(inputValue.trim());
    }
  };

  const handleClear = () => {
    setInputValue('');
    onSearch?.('');
  };

  return (
    <form
      action={action}
      method="GET"
      onSubmit={handleSubmit}
      className={cn('flex w-full gap-2.5', className)}
    >
      {/* Hidden fields preserve other active filters during native no-JS GET submission */}
      {hiddenFields &&
        Object.entries(hiddenFields).map(([key, val]) =>
          val ? <input key={key} type="hidden" name={key} value={val} /> : null,
        )}

      <div className="relative flex-1 flex items-center bg-card border border-border rounded-xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        <Search aria-hidden="true" className="size-4 text-muted-foreground shrink-0 mr-2.5" />
        <input
          type="text"
          name="search"
          aria-label={placeholder}
          className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
          autoComplete="off"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <button
        type="submit"
        className="px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs"
      >
        Search
      </button>
    </form>
  );
};
