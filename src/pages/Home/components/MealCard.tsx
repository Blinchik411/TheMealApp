import React from "react";
import { type Meal } from "../../../types/meal.types.ts";
import RouterLink from "../../../components/RouterLink.tsx";
import FavoriteButton from "../../../components/FavoriteButton.tsx";

interface MealCardProps {
    meal: Meal;
    from?: string;
}

const MealCard: React.FC<MealCardProps> = ({ meal, from }) => {



    const linkTo = from ? `/meal/${meal.idMeal}?from=${from}` : `/meal/${meal.idMeal}`;


    return (
        <div>
            <img src={meal.strMealThumb} alt={meal.strMeal}/>
            <div>
                <h3>{meal.strMeal}</h3>
                <FavoriteButton meal={meal} stopProp={true}/>
            </div>
            <RouterLink
                to={linkTo}
            >
                View Recipe
            </RouterLink>
        </div>
    )
}

export default MealCard