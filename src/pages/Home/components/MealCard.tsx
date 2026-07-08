import React from "react";
import { type Meal } from "@/types/meal.types";
import RouterLink from "../../../components/RouterLink.tsx";
import FavoriteButton from "../../../components/FavoriteButton.tsx";

interface MealCardProps {
    meal: Meal;
    from?: string;
}

const MealCard: React.FC<MealCardProps> = ({ meal, from }) => {
    const linkTo = from ? `/meal/${meal.idMeal}?from=${from}` : `/meal/${meal.idMeal}`;

    return (
        <div className="flex flex-col h-full bg-card rounded-xl overflow-hidden border shadow-sm">
            {/* 🛠️ ФИКС CLS: Обертка для картинки с фиксированным соотношением сторон */}
            <div className="relative w-full  aspect-square bg-muted/50 overflow-hidden">
                <img
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-104"
                    loading="lazy" // Оптимизация загрузки изображений вне экрана
                />
            </div>

            {/* Контент карточки */}
            <div className="p-4 flex flex-col flex-grow gap-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                        {meal.strMeal}
                    </h3>
                    <FavoriteButton meal={meal} stopProp={true}/>
                </div>

                {/* Выталкиваем ссылку вниз, чтобы кнопки всегда были на одном уровне */}
                <div className="mt-auto">
                    <RouterLink
                        to={linkTo}
                        className="inline-flex w-full justify-center items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                    >
                        View Recipe
                    </RouterLink>
                </div>
            </div>
        </div>
    )
}

export default React.memo(MealCard);