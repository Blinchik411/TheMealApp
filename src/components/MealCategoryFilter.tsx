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

    const isAllActive = activeCategory === "";

    return (
        <div className="flex flex-wrap gap-2">
            <button
                className={`w-full md:w-auto px-5 py-2.5 font-medium text-sm rounded-xl border transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer
                    ${isAllActive
                    ? "bg-gray-900 text-white border-gray-900" 
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900" 
                }`}
                type="button"
                onClick={() => onSelectCategory("")}
            >
                All
            </button>

            {categories.map((category) => {
                const isActive = activeCategory === category;

                return (
                    <button
                        className={`w-full md:w-auto px-5 py-2.5 font-medium text-sm rounded-xl border  inline-flex items-center justify-center gap-2 shadow-sm  cursor-pointer
                           transition-transform duration-200 hover:scale-105 active:scale-95
                            ${isActive
                            ? "bg-gray-900 text-white border-gray-900" 
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900" 
                        }`}
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

export default React.memo(MealCategoryFilter); // 🛠️ Не забываем memo, раз мы боремся за ререндеры!