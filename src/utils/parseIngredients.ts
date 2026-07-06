import { type Meal } from "../types/meal.types.ts"
import {type IngredientItem} from "../types/meal.types.ts";

export const parseIngredients = (meal:Meal): IngredientItem[] => {

    const ingredients: IngredientItem[] = [];

    for (let i = 0;i <= 20; i++) {

        const ingredientKey = `strIngredient${i}` as keyof Meal
        const measureKey = `strMeasure${i}` as keyof Meal

        const name = meal[ingredientKey]
        const measure = meal[measureKey]

        if (typeof name === 'string' && name.trim() !== '') {
            ingredients.push({
                id: `${name}-${i}`,
                name: name.trim(),
                measure: typeof measure === 'string' ? measure.trim() : ''
            })
        }
    }
    return ingredients
}