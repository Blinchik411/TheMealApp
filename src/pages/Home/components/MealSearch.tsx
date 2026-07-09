import React, { useState, useEffect } from "react";

interface MealSearchProps {
    value: string;
    onSearch: (query: string) => void;
}

const MealSearch: React.FC<MealSearchProps> = ({ value, onSearch }) => {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        onSearch(inputValue);
    };

    const handleClear = () => {
        setInputValue('');
        onSearch('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex w-full gap-3">


            <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-gray-400 transition-colors">
                <input
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400"
                    autoComplete="off"
                    placeholder="Pancakes"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />

                {inputValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer text-sm font-medium ml-2"
                    >
                        ✕
                    </button>
                )}
            </div>


            <button
                type="submit"
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800  hover:scale-105 text-white font-medium text-sm rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
            >
                Search
            </button>
        </form>
    );
};

export default React.memo(MealSearch);