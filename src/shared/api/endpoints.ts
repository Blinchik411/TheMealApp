const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export const API_ENDPOINTS = {
  getMealById: (id: string) => `${BASE_URL}/lookup.php?i=${encodeURIComponent(id.trim())}`,
  searchByFirstLetter: (letter: string) =>
    `${BASE_URL}/search.php?f=${encodeURIComponent(letter.trim())}`,
  searchByName: (name: string) => `${BASE_URL}/search.php?s=${encodeURIComponent(name.trim())}`,
  getAreaList: () => `${BASE_URL}/list.php?a=list`,
  searchByArea: (area: string) => `${BASE_URL}/filter.php?a=${encodeURIComponent(area.trim())}`,
  getCategoryList: () => `${BASE_URL}/list.php?c=list`,
  searchByCategory: (category: string) =>
    `${BASE_URL}/filter.php?c=${encodeURIComponent(category.trim())}`,
};
