import { supabase } from '@/shared/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mealApi } from './mealApi';

vi.mock('@/shared/api', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('mealApi with Supabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMealById возвращает null при пустом id', async () => {
    const result = await mealApi.getMealById('   ');
    expect(result).toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('getMealById возвращает смапленный рецепт при успешном запросе', async () => {
    const mockRow = {
      id: '52772',
      slug: 'chicken-teriyaki',
      name: { en: 'Chicken Teriyaki', ru: 'Курица терияки' },
      category: { en: 'Chicken', ru: 'Курица' },
      area: { en: 'Japanese', ru: 'Японская' },
      image_url: 'https://example.com/pic.jpg',
      ingredients: [],
      steps: [],
      instructions: { en: 'Cook it', ru: 'Приготовьте' },
      nutrition: { calories: 450, protein: 35, fat: 12, carbs: 20 },
      servings: 2,
      prep_time_minutes: 10,
      cook_time_minutes: 15,
      total_time_minutes: 25,
      difficulty: 'easy',
      dietary: { isVegetarian: false, isVegan: false, isGlutenFree: false, isDairyFree: true },
      meal_type: ['lunch', 'dinner'],
    };

    const maybeSingleMock = vi.fn().mockResolvedValue({ data: mockRow, error: null });
    const orMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
    const selectMock = vi.fn().mockReturnValue({ or: orMock });

    vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as unknown as ReturnType<
      typeof supabase.from
    >);

    const result = await mealApi.getMealById('52772', 'ru');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('52772');
    expect(result?.title).toBe('Курица терияки');
    expect(result?.category).toBe('Курица');
    expect(result?.totalTimeMinutes).toBe(25);
  });

  it('searchByName возвращает пустой массив при пустом запросе', async () => {
    const result = await mealApi.searchByName('  ');
    expect(result).toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('searchByName выполняет поиск в Supabase', async () => {
    const mockRows = [
      {
        id: '1',
        slug: 'chicken-soup',
        name: { en: 'Chicken Soup', ru: 'Куриный суп' },
        category: { en: 'Chicken', ru: 'Курица' },
        area: { en: 'Russian', ru: 'Русская' },
        image_url: 'https://example.com/soup.jpg',
        ingredients: [],
        steps: [],
        instructions: { en: '', ru: '' },
      },
    ];

    const limitMock = vi.fn().mockResolvedValue({ data: mockRows, error: null });
    const orderMock = vi.fn().mockReturnValue({ limit: limitMock });
    const orMock = vi.fn().mockReturnValue({ order: orderMock });
    const selectMock = vi.fn().mockReturnValue({ or: orMock });

    vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as unknown as ReturnType<
      typeof supabase.from
    >);

    const results = await mealApi.searchByName('суп', 'ru');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Куриный суп');
  });

  it('getCategories возвращает список названий категорий', async () => {
    const mockCategories = [
      { name: { en: 'Dessert', ru: 'Десерты' } },
      { name: { en: 'Chicken', ru: 'Курица' } },
    ];

    const orderMock = vi.fn().mockResolvedValue({ data: mockCategories, error: null });
    const neqMock = vi.fn().mockReturnValue({ order: orderMock });
    const selectMock = vi.fn().mockReturnValue({ neq: neqMock });

    vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as unknown as ReturnType<
      typeof supabase.from
    >);

    const categories = await mealApi.getCategories('ru');
    expect(categories).toEqual(['Десерты', 'Курица']);
  });
});
