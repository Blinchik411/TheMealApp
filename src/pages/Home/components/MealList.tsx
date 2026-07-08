import React from "react";
import { type Meal } from "@/types/meal.types";
import MealCard from "./MealCard.tsx";

interface MealListProps {
    meals: Meal[];
}

const MealList: React.FC<MealListProps> = ({meals}) => {

    const hasMeal = meals.length > 0



    if (!hasMeal) {
        return <div >Recipe not found </div>
    }


    return (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {meals.map((meal) => (
                <li key={meal.idMeal} className={'meals-item'}>
                    <MealCard meal={meal}/>
                </li>
            ))}
        </ul>
    )


}

export default React.memo(MealList)