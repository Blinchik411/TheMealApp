import React from 'react';
import {useFavorites} from './FavoritesContext.tsx';
import {type Meal} from '../types/meal.types';

interface FavoriteButtonProps {
    meal: Meal;
    showText?: boolean;
    stopProp?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({meal, showText = false, stopProp = false}) => {
    const {toggleFavorite, isFavorite} = useFavorites();
    const liked = isFavorite(meal.idMeal);

    const handleClick = (e: React.MouseEvent) => {
        if (stopProp) {
            e.stopPropagation();
        }
        toggleFavorite(meal);
    };

    return (
        <button onClick={handleClick} className="text-lg font-semibold">
            {liked ? '❤️' : '🤍'}
            {showText && (liked ? ' In Favorites' : ' Add to Favorites')}
        </button>
    );
};

export default FavoriteButton;