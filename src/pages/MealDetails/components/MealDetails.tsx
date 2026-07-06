import React from 'react';
import useFetch from "../../../hooks/useFetch.ts";
import {type MealResponse} from "../../../types/meal.types.ts";
import RouterLink from "../../../components/RouterLink.tsx";
import {parseIngredients} from "../../../utils/parseIngredients.ts";
import {API_ENDPOINTS} from "../../../api/endpoints.ts";
import {parseInstructions} from "../../../utils/parseInstructions.ts";
import FavoriteButton from "../../../components/FavoriteButton.tsx";

interface MealDetailProps {
    params: Record<string, string>;
}

const MealDetails: React.FC<MealDetailProps> = ({params}) => {
    const { id } = params

    const { data, isLoading, error } = useFetch<MealResponse>(API_ENDPOINTS.getMealById(id))


    if(isLoading) {
        return  (
            <p>Loading...</p>
        )
    }

    if(error) {
        return (
            <p>Error: {error}</p>
        )
    }

    const meal = data?.meals?.[0]

    if (!meal) {
        return <p>Recipe not found </p>;
    }

    const ingredients = parseIngredients(meal)

    const clearInstructions = parseInstructions(meal?.strInstructions);

    const queryParams = new URLSearchParams(window.location.search);
    const backTo = queryParams.get('from') === 'favorites' ? '/favorites' : '/';

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <RouterLink
                to={backTo}
                className="inline-flex items-center text-lg font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6"
            >
                ← Back to list
            </RouterLink>


            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    {meal.strMeal}
                </h1>
                <div className="flex-shrink-0">
                    <FavoriteButton meal={meal} showText={true}/>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                <div className="w-full">
                    <img
                        src={meal.strMealThumb}
                        alt={meal.strMeal}
                        className="w-full h-[500px] object-cover rounded-2xl shadow-md"
                    />
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ingredients.map((ingredient) => (
                            <li
                                key={ingredient.id}
                                className="bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100 text-sm text-gray-700 font-medium"
                            >
                                <span className="text-gray-900">{ingredient.name}</span>
                                <span className="text-gray-400 block text-xs mt-0.5">{ingredient.measure}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructions</h2>
                <ol className="space-y-4">
                    {clearInstructions.map((clearInstruction, index) => (
                        <li
                            key={clearInstruction + index}
                            className="flex gap-4 text-gray-600 leading-relaxed text-base"
                        >
                        <span className="flex-shrink-0 flex items-center justify-center bg-gray-100 text-gray-700 font-bold text-sm w-7 h-7 rounded-full">
                            {index + 1}
                        </span>
                            <p className="pt-0.5">{clearInstruction}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

export default MealDetails
