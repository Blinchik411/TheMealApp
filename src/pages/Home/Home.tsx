import React, {useState, useReducer, useMemo} from 'react';
import useFetch from "../../hooks/useFetch.ts";
import { type MealResponse } from "@/types/meal.types.ts";
import MealList from "./components/MealList.tsx";
import {getRandomLetter} from "@/utils/getRandomLetter.ts";
import {API_ENDPOINTS} from "@/api/endpoints.ts";
import MealSearch from "./components/MealSearch.tsx";
import MealAreaFilter from "./components/MealAreaFilter.tsx";
import MealCategoryFilter from "@/components/MealCategoryFilter.tsx";

interface FilterState {
    activeSearch: string;
    selectedArea: string;
    selectedCategory: string;
}

type FilterAction =
    | { type: 'SET_SEARCH'; query: string }
    | { type: 'SET_AREA'; area: string }
    | { type: 'SET_CATEGORY'; category: string }
    | { type: 'RESET_FILTERS';};


const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
    switch (action.type) {
        case 'SET_SEARCH':
            return { activeSearch: action.query, selectedArea: '', selectedCategory: '' };
        case 'SET_AREA':
            return { activeSearch: '', selectedArea: action.area, selectedCategory: '' };
        case 'SET_CATEGORY':
            return { activeSearch: '', selectedArea: '', selectedCategory: action.category };
        case 'RESET_FILTERS':
            return { activeSearch: '', selectedArea: '', selectedCategory: '' }
        default:
            return state;
    }
};

const Home: React.FC = () => {

    const [randomLetter] = useState(() => getRandomLetter());

    const {
        data: catsData,
        isLoading: isCatsLoading,
        error: catsError
    } = useFetch<{ meals: Array<{ strCategory: string }> }>(API_ENDPOINTS.getFilterCategoryList());

    const allCategories = catsData?.meals.map(meal => meal.strCategory) || [];

    const [state, dispatch] = useReducer(filterReducer, { activeSearch: '', selectedArea: '', selectedCategory: ''});
    const { activeSearch, selectedArea, selectedCategory } = state;

    const apiUrl = activeSearch
        ? API_ENDPOINTS.searchByName(activeSearch)
        : selectedCategory
            ? API_ENDPOINTS.searchByFilterCategory(selectedCategory)
            : selectedArea
                ? API_ENDPOINTS.searchByAreas(selectedArea)
                : API_ENDPOINTS.searchByFirstLetter(randomLetter);


    const {
        data,
        isLoading: isMealsLoading,
        error: mealsError
    } = useFetch<MealResponse>(apiUrl);

    const memoizedMeals = useMemo(() => {
        return data?.meals || [];
    }, [data?.meals]);

    if (isCatsLoading || isMealsLoading) return <p>Loading...</p>;


    if (catsError || mealsError) return <p>Error: {catsError || mealsError}</p>;


    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Главный заголовок сайта */}
            <div className="text-center md:text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                    Recipe Catalog from Immature
                </h1>
                <p className="mt-2 text-sm md:text-base text-gray-500">
                    Discover the best recipes from around the world!
                </p>
            </div>

            {/* Панель фильтров и поиска */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 mb-10">
                {/* Строка поиска */}
                <div className="w-full">
                    <MealSearch
                        value={activeSearch}
                        onSearch={(query) => dispatch({ type: 'SET_SEARCH', query })}
                    />
                </div>

                {/* Блок селекторов/фильтров */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2 border-t border-gray-50">
                    <div className="flex-1 space-y-4">
                        <MealAreaFilter
                            value={selectedArea || 'All countries'}
                            onSelectedArea={(area) => dispatch({ type: 'SET_AREA', area })}
                        />
                        <MealCategoryFilter
                            categories={allCategories}
                            activeCategory={selectedCategory}
                            onSelectCategory={(category) => dispatch({ type: 'SET_CATEGORY', category })}
                        />
                    </div>

                    {/* Кнопка сброса фильтров */}
                    <button
                        onClick={() => dispatch({ type: 'RESET_FILTERS' })}
                        className="w-full md:w-auto px-5 py-2.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 font-medium text-sm rounded-xl border border-gray-200 hover:border-red-100 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Reset filters
                    </button>
                </div>
            </div>

            {/* Сетка со списком блюд */}
            <div>
                <MealList meals={memoizedMeals || []} />
            </div>
        </div>
    );
};

export default Home;