import React from "react";

interface MealCategoryFilterProps {
    categories: string[];
    activeCategory: string;
    onSelectCategory: (category: string) => void;
}

const MealCategoryFilter: React.FC<MealCategoryFilterProps> = ({
                                                                   categories,
                                                                   activeCategory,
                                                                   onSelectCategory,
                                                               }) => {
    return (
        <div>
            <button
                type="button"
                onClick={() => onSelectCategory("")}
            >
                All
            </button>

            {categories.map((category) => {

                return (
                    <button
                        key={category}
                        type="button"
                        onClick={() => onSelectCategory(category)}
                    >
                        {category}
                    </button>
                );
            })}
        </div>
    );
};

export default MealCategoryFilter;