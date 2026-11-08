import { supabase } from '@/shared/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MEAL_SAMPLING_MAX_OFFSET, getRandomMeal, getRandomMealOffset } from './mealSampling';

vi.mock('@/shared/api', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('mealSampling module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MEAL_SAMPLING_MAX_OFFSET', () => {
    it('is configured to 790', () => {
      expect(MEAL_SAMPLING_MAX_OFFSET).toBe(790);
    });
  });

  describe('getRandomMealOffset', () => {
    it('generates non-negative integer strictly less than maxOffset across 1,000 iterations', () => {
      for (let i = 0; i < 1000; i++) {
        const offset = getRandomMealOffset();
        expect(Number.isInteger(offset)).toBe(true);
        expect(offset).toBeGreaterThanOrEqual(0);
        expect(offset).toBeLessThan(MEAL_SAMPLING_MAX_OFFSET);
      }
    });

    it('handles boundary custom offsets (0, 1, custom)', () => {
      expect(getRandomMealOffset(1)).toBe(0);
      expect(getRandomMealOffset(0)).toBe(0);

      for (let i = 0; i < 100; i++) {
        const offset = getRandomMealOffset(50);
        expect(offset).toBeGreaterThanOrEqual(0);
        expect(offset).toBeLessThan(50);
      }
    });
  });

  describe('getRandomMeal', () => {
    const mockRow = {
      id: '52800',
      slug: 'random-dish',
      name: { en: 'Random Dish', ru: 'Случайное блюдо' },
      category: { en: 'Beef', ru: 'Говядина' },
      area: { en: 'Italian', ru: 'Итальянская' },
      image_url: 'https://example.com/random.jpg',
      ingredients: [],
      steps: [],
      instructions: { en: 'Cook random', ru: 'Приготовьте' },
      nutrition: { calories: 500, protein: 30, fat: 20, carbs: 40 },
      servings: 4,
      prep_time_minutes: 15,
      cook_time_minutes: 25,
      total_time_minutes: 40,
      difficulty: 'medium',
      dietary: { isVegetarian: false, isVegan: false, isGlutenFree: false, isDairyFree: false },
      meal_type: ['dinner'],
    };

    it('returns mapped meal on successful primary random range query', async () => {
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: mockRow, error: null });
      const rangeMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const selectMock = vi.fn().mockReturnValue({ range: rangeMock });

      vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as unknown as ReturnType<
        typeof supabase.from
      >);

      const result = await getRandomMeal('ru');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('52800');
      expect(result?.title).toBe('Случайное блюдо');
      expect(result?.category).toBe('Говядина');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(rangeMock).toHaveBeenCalled();
    });

    it('falls back to first meal when primary random offset returns null or error', async () => {
      const fallbackRow = { ...mockRow, id: '1', name: { en: 'Fallback Dish', ru: 'Фоллбэк' } };

      const randomMaybeSingle = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Out of range' } });
      const randomRange = vi.fn().mockReturnValue({ maybeSingle: randomMaybeSingle });

      const fallbackMaybeSingle = vi.fn().mockResolvedValue({ data: fallbackRow, error: null });
      const fallbackLimit = vi.fn().mockReturnValue({ maybeSingle: fallbackMaybeSingle });

      const selectMock = vi
        .fn()
        .mockReturnValueOnce({ range: randomRange })
        .mockReturnValueOnce({ limit: fallbackLimit });

      vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as unknown as ReturnType<
        typeof supabase.from
      >);

      const result = await getRandomMeal('en');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
      expect(result?.title).toBe('Fallback Dish');
      expect(fallbackLimit).toHaveBeenCalledWith(1);
    });

    it('returns null gracefully when both primary and fallback fail', async () => {
      const randomMaybeSingle = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Out of range' } });
      const randomRange = vi.fn().mockReturnValue({ maybeSingle: randomMaybeSingle });

      const fallbackMaybeSingle = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Table empty' } });
      const fallbackLimit = vi.fn().mockReturnValue({ maybeSingle: fallbackMaybeSingle });

      const selectMock = vi
        .fn()
        .mockReturnValueOnce({ range: randomRange })
        .mockReturnValueOnce({ limit: fallbackLimit });

      vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as unknown as ReturnType<
        typeof supabase.from
      >);

      const result = await getRandomMeal('en');
      expect(result).toBeNull();
    });

    it('handles unexpected thrown exceptions gracefully without crashing', async () => {
      const selectMock = vi.fn().mockImplementation(() => {
        throw new Error('Supabase client network crashed');
      });

      vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as unknown as ReturnType<
        typeof supabase.from
      >);

      const result = await getRandomMeal('en');
      expect(result).toBeNull();
    });
  });
});
