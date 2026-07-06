import React from 'react';
import {useFavorites} from './FavoritesContext.tsx';
import {type Meal} from '../types/meal.types';
import { Heart } from "lucide-react";

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
// Внутри компонента:
    <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 text-lg font-semibold group"
    >
        {/* Иконка с жестко заданным размером (w-5 h-5 — это ровно 20px) */}
        <Heart
            className={`w-5 h-5 transition-colors ${
                liked
                    ? "fill-red-500 text-red-500"
                    : "text-neutral-500 group-hover:text-neutral-700"
            }`}
        />

        {/* Текстовая сетка, которую мы настроили ранее */}
        {showText && (
            <span className="grid text-left">
      <span className="invisible col-start-1 row-start-1 pointer-events-none select-none">
        In Favorites
      </span>
      <span className="col-start-1 row-start-1">
        {liked ? 'In Favorites' : 'To Favorites'}
      </span>
    </span>
        )}
    </button>
    );
};

export default FavoriteButton;