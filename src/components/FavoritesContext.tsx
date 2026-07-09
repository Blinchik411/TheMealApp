/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { type Meal } from "@/types/meal.types";

interface FavoritesContextType {
    favorites: Meal[];
    toggleFavorite: (meal: Meal) => void;
    isFavorite: (idMeal: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<Meal[]>(() => {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = useCallback((meal: Meal) => {
        setFavorites((prev) => {
            const isExist = prev.some((item) => item.idMeal === meal.idMeal);
            if (isExist) {
                return prev.filter((item) => item.idMeal !== meal.idMeal);
            } else {
                return [...prev, meal];
            }
        });
    }, []);

    const isFavorite = useCallback((idMeal: string) => {
        return favorites.some((item) => item.idMeal === idMeal);
    }, [favorites]);

    const value = useMemo(() => ({
        favorites,
        toggleFavorite,
        isFavorite
    }), [favorites, toggleFavorite, isFavorite])

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};