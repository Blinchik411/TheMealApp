'use client';

import { Globe } from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';

interface MealAreaFilterProps {
  areas: string[];
  selectedArea: string;
  onSelectArea: (area: string) => void;
  isLoading?: boolean;
}

export const MealAreaFilter: React.FC<MealAreaFilterProps> = ({
  areas,
  selectedArea,
  onSelectArea,
  isLoading = false,
}) => {
  const uniqueAreas = useMemo(() => Array.from(new Set(areas)), [areas]);

  return (
    <div className="relative inline-flex items-center min-w-[200px]">
      <Globe className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
      <select
        value={selectedArea}
        disabled={isLoading}
        onChange={(e) => onSelectArea(e.target.value)}
        className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-xl border border-border bg-card text-foreground appearance-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer disabled:opacity-50"
      >
        <option value="">All Cuisines</option>
        {uniqueAreas.map((area) => (
          <option key={area} value={area}>
            {area}
          </option>
        ))}
      </select>
      <div className="absolute right-3 pointer-events-none text-muted-foreground text-xs">▼</div>
    </div>
  );
};
