export interface Meal {
    idMeal : string,
    strMeal: string,
    strMealThumb: string,
    strInstructions: string,
    [key: string]: string | null | undefined;

}

export interface MealResponse {
    meals: Meal[] | null,
}

export interface AreaResponse {
    meals: AreaItem[] | null
}

export interface IngredientItem {
    id: string;
    name: string;
    measure: string;
}

export interface AreaItem {
    strArea: string,
    strCountry: string,
}