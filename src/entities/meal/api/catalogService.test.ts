import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Meal } from '../model/types';
import { getFilteredCatalog } from './catalogService';
import { mealApi } from './mealApi';

const mockMeal = (id: string, name: string): Meal => ({
  idMeal: id,
  strMeal: name,
  strMealThumb: `https://example.com/${id}.jpg`,
  strCategory: 'Seafood',
  strArea: 'Italian',
  strInstructions: 'Cook it',
  strTags: null,
  strYoutube: null,
  strMealAlternate: null,
  strCountry: null,
  strSource: null,
  strImageSource: null,
  strCreativeCommonsConfirmed: null,
  dateModified: null,
});

describe('getFilteredCatalog', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(mealApi, 'getCategories').mockResolvedValue(['Seafood', 'Pasta']);
    vi.spyOn(mealApi, 'getAreas').mockResolvedValue(['Italian', 'Canadian']);
  });

  it('запрашивает каталог по умолчанию, если фильтры не переданы', async () => {
    const defaultMeals = [mockMeal('1', 'Beef Stew')];
    const letterSpy = vi.spyOn(mealApi, 'searchByLetter').mockResolvedValue(defaultMeals);

    const result = await getFilteredCatalog({ page: 1 });

    expect(letterSpy).toHaveBeenCalledWith('b');
    expect(result.meals).toEqual(defaultMeals);
    expect(result.categories).toEqual(['Seafood', 'Pasta']);
    expect(result.areas).toEqual(['Italian', 'Canadian']);
  });

  it('вызывает одиночный фильтр без оверхеда на пересечение', async () => {
    const categoryMeals = [mockMeal('2', 'Salmon')];
    const catSpy = vi.spyOn(mealApi, 'filterByCategory').mockResolvedValue(categoryMeals);

    const result = await getFilteredCatalog({ category: 'Seafood', page: 1 });

    expect(catSpy).toHaveBeenCalledWith('Seafood');
    expect(result.meals).toEqual(categoryMeals);
  });

  it('корректно выполняет пересечение нескольких критериев (Категория + Кухня)', async () => {
    const categoryMeals = [mockMeal('10', 'Salmon Pasta'), mockMeal('20', 'Tuna Salad')];
    const areaMeals = [mockMeal('10', 'Salmon Pasta'), mockMeal('30', 'Italian Pizza')];

    vi.spyOn(mealApi, 'filterByCategory').mockResolvedValue(categoryMeals);
    vi.spyOn(mealApi, 'filterByArea').mockResolvedValue(areaMeals);

    const result = await getFilteredCatalog({
      category: 'Seafood',
      area: 'Italian',
      page: 1,
    });

    // В пересечении должно остаться только блюдо с idMeal 10 (Salmon Pasta)
    expect(result.meals).toHaveLength(1);
    expect(result.meals[0]?.idMeal).toBe('10');
  });

  it('отдает пустой массив, если пересечение не дало совпадений', async () => {
    vi.spyOn(mealApi, 'filterByCategory').mockResolvedValue([mockMeal('1', 'Fish')]);
    vi.spyOn(mealApi, 'filterByArea').mockResolvedValue([mockMeal('2', 'Burger')]);

    const result = await getFilteredCatalog({
      category: 'Seafood',
      area: 'American',
      page: 1,
    });

    expect(result.meals).toEqual([]);
  });

  it('не падает при ошибке загрузки справочников (Graceful Degradation)', async () => {
    vi.spyOn(mealApi, 'getCategories').mockRejectedValue(new Error('API Failure'));
    vi.spyOn(mealApi, 'searchByLetter').mockResolvedValue([mockMeal('1', 'Bread')]);

    const result = await getFilteredCatalog({ page: 1 });

    expect(result.categories).toEqual([]); // Справочник пуст, но не вызвал краш
    expect(result.meals).toHaveLength(1); // Рецепты загружены успешно!
    expect(result.error).toBeUndefined();
  });
});
