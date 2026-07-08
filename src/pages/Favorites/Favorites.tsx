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
        <div>
            <h2>Favorite recipes {favorites.length}</h2>
            <MealSearch
                value={searchQuery}
                onSearch={(query) => setSearchQuery(query)}
            />
            <MealCategoryFilter
                categories={allFavoritesCategory}
                activeCategory={activeCategory}
                onSelectCategory={(category) => setActiveCategory(category)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favoritesContent}
            </div>
        </div>
    );
};

export default FavoritesPage;