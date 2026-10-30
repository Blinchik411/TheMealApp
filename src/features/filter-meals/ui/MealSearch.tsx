'use client';

import { Search, X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

interface MealSearchProps {
  value: string;
  onSearch: (query: string) => void;
}

export const MealSearch = ({ value, onSearch }: MealSearchProps) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(inputValue.trim());
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2.5">
      <div className="relative flex-1 flex items-center bg-card border border-border rounded-xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        <Search className="size-4 text-muted-foreground shrink-0 mr-2.5" />
        <input
          type="text"
          className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
          autoComplete="off"
          placeholder="Search recipes (e.g., Pancakes, Chicken, Pie)..."
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
