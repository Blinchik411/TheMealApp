import React, { useState } from 'react';
import { useFavorites } from "@/components/FavoritesContext";
import MealCard from "@/pages/Home/components/MealCard";
import MealSearch from "@/pages/Home/components/MealSearch";
import MealCategoryFilter from "@/components/MealCategoryFilter";

const FavoritesPage: React.FC = () => {
    const { favorites } = useFavorites();
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('')

    const hasFavorites = favorites.length > 0;

    if (!hasFavorites) {
        return (
            <div>
                <h2>Your favorites list is empty.</h2>
                <p>Add recipes on the description page to make them appear here.</p>
            </div> 
        );
    }

    const filteredFavorites = favorites.filter((meal) =>
        meal.strMeal.toLowerCase().includes(searchQuery.toLowerCase()) && (!activeCategory || meal.strCategory === activeCategory)
    );

    const allFavoritesCategory =  [
        ...new Set(favorites.map((meal) => meal.strCategory).filter(Boolean)) // берем только уникальные категории и фильтруем falsy значения
    ] as string[];

    const favoritesContent = filteredFavorites.length > 0
        ? (filteredFavorites.map((meal) => (
            <MealCard key={meal.idMeal} meal={meal} from="favorites" />
        ))
        )
        : (
        <p>No favorite recipes match your search.</p>
        )

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center md:text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight ">
                    Favorite recipes - {favorites.length}
                </h1>
                <p className="mt-2 text-sm md:text-base text-gray-500">
                    Your personal collection of the best recipes from around the world!
                </p>
            </div>
            <div
                className="max-w-6xl mx-auto px-4 py-8 bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 mb-10">
                <MealSearch
                    value={searchQuery}
                    onSearch={(query) => setSearchQuery(query)}
                />
                <MealCategoryFilter
                    categories={allFavoritesCategory}
                    activeCategory={activeCategory}
                    onSelectCategory={(category) => setActiveCategory(category)}
                />
            </div>
            <div className="max-w-6xl mx-auto  grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favoritesContent}
            </div>
        </div>
    );
};

export default FavoritesPage;