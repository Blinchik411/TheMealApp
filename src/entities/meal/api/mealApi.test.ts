import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mealApi } from './mealApi';

describe('mealApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getMealById возвращает null при пустом id', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await mealApi.getMealById('   ');
    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('getMealById возвращает смапленный рецепт при успешном запросе', async () => {
    const mockJson = {
      meals: [
        {
          idMeal: '52772',
          strMeal: 'Chicken Teriyaki',
          strMealThumb: 'https://example.com/pic.jpg',
          strCategory: 'Chicken',
          strArea: 'Japanese',
        },
      ],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockJson,
      }),
    );

    const result = await mealApi.getMealById('52772');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('52772');
    expect(result?.title).toBe('Chicken Teriyaki');
    expect(result?.category).toBe('Chicken');
  });

  it('filterByCategory прокидывает переданную категорию в fallback', async () => {
    const mockFilterJson = {
      meals: [
        {
          idMeal: '123',
          strMeal: 'Salmon Steak',
          strMealThumb: 'https://example.com/salmon.jpg',
        },
      ],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockFilterJson,
      }),
    );

    const result = await mealApi.filterByCategory('Seafood');
    expect(result).toHaveLength(1);
    expect(result[0]?.category).toBe('Seafood');
  });

  it('filterByArea прокидывает переданную кухню в fallback', async () => {
    const mockFilterJson = {
      meals: [
        {
          idMeal: '456',
          strMeal: 'Carbonara',
          strMealThumb: 'https://example.com/pasta.jpg',
        },
      ],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockFilterJson,
      }),
    );

    const result = await mealApi.filterByArea('Italian');
    expect(result).toHaveLength(1);
    expect(result[0]?.cuisine).toBe('Italian');
  });

  it('searchByLetter нормализует строку до первого символа', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ meals: [] }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await mealApi.searchByLetter('chicken');
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('f=c'), expect.any(Object));
  });

  it('выбрасывает ошибку при HTTP статусе отличного от 2xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    await expect(mealApi.getMealById('123')).rejects.toThrow('Failed to load recipe (HTTP 500)');
  });

  it('выбрасывает ошибку при невалидном JSON ответе', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token <');
        },
      }),
    );

    await expect(mealApi.getMealById('123')).rejects.toThrow(
      'Failed to load recipe: Invalid JSON response',
    );
  });
});
