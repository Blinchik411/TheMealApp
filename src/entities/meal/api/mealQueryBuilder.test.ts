import { supabase } from '@/shared/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildMealsFilterQuery,
  fetchMealByIdRaw,
  fetchMealsByOrCondition,
} from './mealQueryBuilder';

vi.mock('@/shared/api', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('mealQueryBuilder module', () => {
  let mockChain: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockChain = {
      select: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    for (const key of Object.keys(mockChain)) {
      if (key !== 'maybeSingle') {
        mockChain[key].mockReturnValue(mockChain);
      }
    }

    vi.mocked(supabase.from).mockReturnValue(
      mockChain as unknown as ReturnType<typeof supabase.from>,
    );
  });

  describe('buildMealsFilterQuery', () => {
    it('applies default limits and ordering when no options provided', () => {
      buildMealsFilterQuery();

      expect(supabase.from).toHaveBeenCalledWith('meals');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.order).toHaveBeenCalledWith('id', { ascending: true });
      expect(mockChain.range).toHaveBeenCalledWith(0, 23); // 0 to 0+24-1
      expect(mockChain.or).not.toHaveBeenCalled();
      expect(mockChain.contains).not.toHaveBeenCalled();
      expect(mockChain.eq).not.toHaveBeenCalled();
      expect(mockChain.lte).not.toHaveBeenCalled();
    });

    it('handles empty strings and whitespace without injecting empty or clauses', () => {
      buildMealsFilterQuery({
        search: '   ',
        category: '   ',
        area: '   ',
        mealType: '   ',
      });

      expect(mockChain.or).not.toHaveBeenCalled();
      expect(mockChain.contains).not.toHaveBeenCalled();
      expect(mockChain.range).toHaveBeenCalledWith(0, 23);
    });

    it('properly constructs search query with trimmed value', () => {
      buildMealsFilterQuery({ search: '  chicken  ' });

      expect(mockChain.or).toHaveBeenCalledWith(
        'name->>ru.ilike.%chicken%,name->>en.ilike.%chicken%',
      );
    });

    it('properly constructs category and area query with trimmed value', () => {
      buildMealsFilterQuery({ category: ' Seafood ', area: ' Italian ' });

      expect(mockChain.or).toHaveBeenCalledWith(
        'category->>en.eq.Seafood,category->>ru.eq.Seafood',
      );
      expect(mockChain.or).toHaveBeenCalledWith('area->>en.eq.Italian,area->>ru.eq.Italian');
    });

    it('normalizes mealType to lowercase and uses array containment', () => {
      buildMealsFilterQuery({ mealType: '  BREAKFAST  ' });

      expect(mockChain.contains).toHaveBeenCalledWith('meal_type', ['breakfast']);
    });

    it('applies difficulty filter', () => {
      buildMealsFilterQuery({ difficulty: 'hard' });

      expect(mockChain.eq).toHaveBeenCalledWith('difficulty', 'hard');
    });

    it('applies maxTime filter only when greater than zero', () => {
      buildMealsFilterQuery({ maxTime: 45 });
      expect(mockChain.lte).toHaveBeenCalledWith('total_time_minutes', 45);

      mockChain.lte.mockClear();
      buildMealsFilterQuery({ maxTime: 0 });
      expect(mockChain.lte).not.toHaveBeenCalled();

      buildMealsFilterQuery({ maxTime: -10 });
      expect(mockChain.lte).not.toHaveBeenCalled();
    });

    it('applies dietary flags correctly when true and ignores when false', () => {
      buildMealsFilterQuery({
        dietary: {
          isVegetarian: true,
          isVegan: false,
          isGlutenFree: true,
          isDairyFree: false,
        },
      });

      expect(mockChain.eq).toHaveBeenCalledWith('dietary->>isVegetarian', 'true');
      expect(mockChain.eq).toHaveBeenCalledWith('dietary->>isGlutenFree', 'true');
      expect(mockChain.eq).not.toHaveBeenCalledWith('dietary->>isVegan', 'true');
      expect(mockChain.eq).not.toHaveBeenCalledWith('dietary->>isDairyFree', 'true');
    });

    it('supports custom pagination offset and limit', () => {
      buildMealsFilterQuery({ limit: 12, offset: 36 });

      expect(mockChain.range).toHaveBeenCalledWith(36, 47); // 36 to 36 + 12 - 1 = 47
    });

    it('combines ALL filter options concurrently into a single query chain', () => {
      buildMealsFilterQuery({
        search: 'curry',
        category: 'Vegetarian',
        area: 'Indian',
        mealType: 'Dinner',
        difficulty: 'medium',
        maxTime: 60,
        dietary: {
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: true,
          isDairyFree: true,
        },
        limit: 10,
        offset: 20,
      });

      expect(mockChain.or).toHaveBeenCalledWith('name->>ru.ilike.%curry%,name->>en.ilike.%curry%');
      expect(mockChain.or).toHaveBeenCalledWith(
        'category->>en.eq.Vegetarian,category->>ru.eq.Vegetarian',
      );
      expect(mockChain.or).toHaveBeenCalledWith('area->>en.eq.Indian,area->>ru.eq.Indian');
      expect(mockChain.contains).toHaveBeenCalledWith('meal_type', ['dinner']);
      expect(mockChain.eq).toHaveBeenCalledWith('difficulty', 'medium');
      expect(mockChain.lte).toHaveBeenCalledWith('total_time_minutes', 60);
      expect(mockChain.eq).toHaveBeenCalledWith('dietary->>isVegetarian', 'true');
      expect(mockChain.eq).toHaveBeenCalledWith('dietary->>isVegan', 'true');
      expect(mockChain.eq).toHaveBeenCalledWith('dietary->>isGlutenFree', 'true');
      expect(mockChain.eq).toHaveBeenCalledWith('dietary->>isDairyFree', 'true');
      expect(mockChain.range).toHaveBeenCalledWith(20, 29);
      expect(mockChain.order).toHaveBeenCalledWith('id', { ascending: true });
    });
  });

  describe('fetchMealByIdRaw', () => {
    const mockMealRow = {
      id: '52771',
      slug: 'spicy-arrabiata',
      name: { en: 'Spicy Arrabiata', ru: 'Острая Аррабиата' },
      category: { en: 'Pasta', ru: 'Паста' },
      area: { en: 'Italian', ru: 'Итальянская' },
      image_url: 'https://example.com/pasta.jpg',
      ingredients: [],
      steps: [],
      instructions: { en: 'Boil pasta', ru: 'Сварите пасту' },
      nutrition: { calories: 400, protein: 12, fat: 8, carbs: 70 },
      servings: 2,
      prep_time_minutes: 5,
      cook_time_minutes: 15,
      total_time_minutes: 20,
      difficulty: 'easy' as const,
      dietary: { isVegetarian: true, isVegan: true, isGlutenFree: false, isDairyFree: true },
      meal_type: ['dinner'],
    };

    it('returns mapped Meal when found by ID or slug', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: mockMealRow, error: null });

      const meal = await fetchMealByIdRaw('52771', 'ru');
      expect(meal).not.toBeNull();
      expect(meal?.id).toBe('52771');
      expect(meal?.title).toBe('Острая Аррабиата');
      expect(mockChain.or).toHaveBeenCalledWith('id.eq.52771,slug.eq.52771');
    });

    it('returns null when record does not exist', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const meal = await fetchMealByIdRaw('non-existent-id', 'en');
      expect(meal).toBeNull();
    });

    it('returns null when Supabase returns an error', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const meal = await fetchMealByIdRaw('err-id', 'en');
      expect(meal).toBeNull();
    });

    it('handles thrown exceptions gracefully without throwing', async () => {
      mockChain.maybeSingle.mockRejectedValueOnce(new Error('Network failure'));

      const meal = await fetchMealByIdRaw('crash-id', 'en');
      expect(meal).toBeNull();
    });

    it('handles special characters in idOrSlug safely', async () => {
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const malformed = "weird'slug%20with@chars!";
      const meal = await fetchMealByIdRaw(malformed, 'en');
      expect(meal).toBeNull();
      expect(mockChain.or).toHaveBeenCalledWith(`id.eq.${malformed},slug.eq.${malformed}`);
    });
  });

  describe('fetchMealsByOrCondition', () => {
    const mockMealRow = {
      id: '52771',
      slug: 'spicy-arrabiata',
      name: { en: 'Spicy Arrabiata', ru: 'Острая Аррабиата' },
      category: { en: 'Pasta', ru: 'Паста' },
      area: { en: 'Italian', ru: 'Итальянская' },
      image_url: 'https://example.com/pasta.jpg',
      ingredients: [],
      steps: [],
      instructions: { en: 'Boil pasta', ru: 'Сварите пасту' },
      nutrition: { calories: 400, protein: 12, fat: 8, carbs: 70 },
      servings: 2,
      prep_time_minutes: 5,
      cook_time_minutes: 15,
      total_time_minutes: 20,
      difficulty: 'easy' as const,
      dietary: { isVegetarian: true, isVegan: true, isGlutenFree: false, isDairyFree: true },
      meal_type: ['dinner'],
    };

    it('returns array of mapped meals on success', async () => {
      mockChain.limit.mockResolvedValueOnce({ data: [mockMealRow], error: null });

      const results = await fetchMealsByOrCondition('category->>en.eq.Pasta', 10, 'ru');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Острая Аррабиата');
      expect(mockChain.or).toHaveBeenCalledWith('category->>en.eq.Pasta');
      expect(mockChain.limit).toHaveBeenCalledWith(10);
      expect(mockChain.order).toHaveBeenCalledWith('id', { ascending: true });
    });

    it('returns empty array when error occurs or data is null', async () => {
      mockChain.limit.mockResolvedValueOnce({ data: null, error: { message: 'Invalid query' } });

      const results = await fetchMealsByOrCondition('invalid', 5, 'en');
      expect(results).toEqual([]);
    });

    it('handles exceptions gracefully without unhandled rejections', async () => {
      mockChain.limit.mockRejectedValueOnce(new Error('Fatal query error'));

      const results = await fetchMealsByOrCondition('bad', 5, 'en');
      expect(results).toEqual([]);
    });
  });
});
