const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';


export const API_ENDPOINTS = {
    getMealById: (id: string) => `${BASE_URL}/lookup.php?i=${id}`,

    searchByFirstLetter: (letter: string) => `${BASE_URL}/search.php?f=${letter}`,

    searchByName: (name: string) => `${BASE_URL}/search.php?s=${name}`,

    getAreaList: () => `${BASE_URL}/list.php?a=list`,

    searchByAreas: (area: string) => `${BASE_URL}/filter.php?a=${area}`,

    getFilterCategoryList: () => `${BASE_URL}/list.php?c=list`,

    searchByFilterCategory: (filter:string) => `${BASE_URL}/filter.php?c=${filter}`

};
