import React, {useState, useEffect} from "react";

interface MealSearchProps {
    value: string;
    onSearch: (query: string) => void;
}
const MealSearch: React.FC<MealSearchProps> = ({ value, onSearch }) => {


    const [inputValue, setInputValue] = useState(value);


    useEffect(() => {
        // eslint-disable-next-line  react-hooks/set-state-in-effect
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
        <form onSubmit={handleSubmit}>
            <div>
                <input
                    type="text"
                    className="form-control"
                    autoComplete="off"
                    placeholder="Pancakes"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                {inputValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                    >
                        ✕
                    </button>
                )}
            </div>
            <button
                type="submit"
            >
                Search
            </button>
        </form>
    );
};

export default MealSearch;