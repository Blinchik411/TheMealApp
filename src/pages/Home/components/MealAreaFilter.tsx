import React from "react";
import useFetch from "../../../hooks/useFetch.ts";
import type {AreaResponse} from "../../../types/meal.types.ts";
import {API_ENDPOINTS} from "../../../api/endpoints.ts";

interface MealAreaFilterProps {
    value: string;
    onSelectedArea: (area: string) => void;
}

const MealAreaFilter: React.FC<MealAreaFilterProps> = ({ value,onSelectedArea}) => {

    const {data, isLoading, error} = useFetch<AreaResponse>(API_ENDPOINTS.getAreaList())

    if (isLoading) return <p>Loading countries...</p>;
    if (error) return <p>Failed to load countries</p>;

    const areas = data?.meals || [];

    return (
        <select
            value={value}
            onChange={(e) => onSelectedArea(e.target.value)}
        >
            <option
                value={''}
            >
                {'All countries'}
            </option>
            {areas.map((area)=> (
                <option
                    key={area.strCountry}
                    value={area.strCountry}
                >
                    {area.strArea}
                </option>
            ))}
        </select>
    )
}

export default MealAreaFilter